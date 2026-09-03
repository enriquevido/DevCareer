import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CvAnalysisStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LatexCompilationClient } from '../../integrations/latex/latex-compilation.client';
import type {
  LatexCompilationFailure,
  LatexCompilationResult,
} from '../../integrations/latex/latex-compilation.types';
import { CompiledPdfStorage } from '../../storage/compiled-pdf.storage';
import { parseCvAnalysisResponse } from '../domain/cv-analysis-response.parser';
import type { CvAnalysisResult } from '../domain/cv-analysis.types';
import {
  applyLatexReplacements,
  type LatexReplacementResult,
} from '../domain/latex-replacement.engine';
import {
  CV_ANALYSIS_PROVIDER,
  type CvAnalysisProvider,
  type CvAnalysisProviderResponse,
} from '../providers/cv-analysis.provider';
import { buildCvAnalysisMessage } from '../providers/cv-analysis.prompt';

type GeneratedAnalysisData = {
  model: string;
  summaryEs: string;
  recommendations: Prisma.InputJsonObject;
  derivedSource: string;
};

@Injectable()
export class CvAnalysisGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CV_ANALYSIS_PROVIDER)
    private readonly provider: CvAnalysisProvider,
    private readonly latexClient: LatexCompilationClient,
    private readonly compiledPdfStorage: CompiledPdfStorage,
  ) {}

  async generate(applicationId: string, resumeVersionId: string) {
    const [application, resumeVersion] = await Promise.all([
      this.prisma.application.findUnique({
        where: { id: applicationId },
        select: {
          id: true,
          company: true,
          jobTitle: true,
          description: true,
        },
      }),
      this.prisma.resumeVersion.findUnique({
        where: { id: resumeVersionId },
        select: {
          id: true,
          source: true,
        },
      }),
    ]);

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (!resumeVersion) {
      throw new NotFoundException('Resume version not found.');
    }

    if (
      !application.description ||
      application.description.trim().length === 0
    ) {
      throw new UnprocessableEntityException(
        'Application must have a job description before generating an analysis.',
      );
    }

    const analysis = await this.prisma.cvAnalysis.create({
      data: {
        applicationId: application.id,
        resumeVersionId: resumeVersion.id,
        status: CvAnalysisStatus.PROCESSING,
        model: this.provider.model,
      },
      select: {
        id: true,
      },
    });

    let providerResponse: CvAnalysisProviderResponse;
    let result: CvAnalysisResult;
    let replacementResult: LatexReplacementResult;

    try {
      providerResponse = await this.provider.generate(
        buildCvAnalysisMessage({
          company: application.company,
          jobTitle: application.jobTitle,
          jobDescription: application.description,
          resumeSource: resumeVersion.source,
        }),
      );

      result = parseCvAnalysisResponse(providerResponse.content);
      replacementResult = applyLatexReplacements(
        resumeVersion.source,
        result.recommendations,
      );
    } catch (error: unknown) {
      return this.markAsAiFailed(analysis.id, getErrorMessage(error));
    }

    const generatedData: GeneratedAnalysisData = {
      model: providerResponse.model,
      summaryEs: result.summaryEs,
      recommendations: {
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        warningsEs: result.warningsEs,
        items: replacementResult.recommendations,
      },
      derivedSource: replacementResult.derivedSource,
    };

    let compilationResult: LatexCompilationResult;

    try {
      compilationResult = await this.latexClient.compile(
        generatedData.derivedSource,
      );
    } catch (error: unknown) {
      return this.markAsCompileFailed(
        analysis.id,
        generatedData,
        `Unexpected compilation error: ${getErrorMessage(error)}`,
      );
    }

    if (!compilationResult.ok) {
      return this.markAsCompileFailed(
        analysis.id,
        generatedData,
        formatCompilationFailure(compilationResult),
      );
    }

    let compiledPdfFile: string;

    try {
      compiledPdfFile = await this.compiledPdfStorage.store(
        compilationResult.pdf,
      );
    } catch (error: unknown) {
      return this.markAsCompileFailed(
        analysis.id,
        generatedData,
        `Could not store compiled PDF: ${getErrorMessage(error)}`,
      );
    }

    try {
      return await this.prisma.cvAnalysis.update({
        where: { id: analysis.id },
        data: {
          ...generatedData,
          status: CvAnalysisStatus.READY,
          compiledPdfFile,
          errorMessage: null,
        },
      });
    } catch (error: unknown) {
      await this.compiledPdfStorage
        .remove(compiledPdfFile)
        .catch(() => undefined);

      throw error;
    }
  }

  private markAsAiFailed(analysisId: string, errorMessage: string) {
    return this.prisma.cvAnalysis.update({
      where: { id: analysisId },
      data: {
        status: CvAnalysisStatus.AI_FAILED,
        errorMessage,
      },
    });
  }

  private markAsCompileFailed(
    analysisId: string,
    generatedData: GeneratedAnalysisData,
    errorMessage: string,
  ) {
    return this.prisma.cvAnalysis.update({
      where: { id: analysisId },
      data: {
        ...generatedData,
        status: CvAnalysisStatus.COMPILE_FAILED,
        compiledPdfFile: null,
        errorMessage,
      },
    });
  }
}

function formatCompilationFailure(failure: LatexCompilationFailure): string {
  const summary = `[${failure.code}] ${failure.message}`;

  if (!failure.diagnostic) {
    return summary;
  }

  return `${summary}\n${failure.diagnostic}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unknown error.';
}
