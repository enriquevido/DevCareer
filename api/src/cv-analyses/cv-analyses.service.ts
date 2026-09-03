import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CvAnalysisStatus, type Prisma } from '@prisma/client';
import { CompiledPdfStorage } from '../latex/compiled-pdf.storage';
import { LatexCompilationClient } from '../latex/latex-compilation.client';
import type {
  LatexCompilationFailure,
  LatexCompilationResult,
} from '../latex/latex-compilation.types';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  CV_ANALYSIS_PROVIDER,
  type CvAnalysisProvider,
  type CvAnalysisProviderResponse,
} from './cv-analysis-provider';
import { buildCvAnalysisMessage } from './cv-analysis.prompt';
import { parseCvAnalysisResponse } from './cv-analysis-response.validator';
import type { CvAnalysisResult } from './cv-analysis.types';
import {
  applyLatexReplacements,
  type LatexReplacementResult,
} from './latex-replacement.engine';

const CV_ANALYSIS_LIST_SELECT = {
  id: true,
  applicationId: true,
  resumeVersionId: true,
  status: true,
  model: true,
  summaryEs: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
} as const;

type GeneratedAnalysisData = {
  model: string;
  summaryEs: string;
  recommendations: Prisma.InputJsonObject;
  derivedSource: string;
};

@Injectable()
export class CvAnalysesService {
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

  async findAllByApplication(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    return this.prisma.cvAnalysis.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      select: CV_ANALYSIS_LIST_SELECT,
    });
  }

  findOne(id: string) {
    return this.prisma.cvAnalysis.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            company: true,
            jobTitle: true,
          },
        },
        resumeVersion: {
          select: {
            id: true,
            originalName: true,
            sha256: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findDerivedSource(id: string) {
    return this.prisma.cvAnalysis.findUnique({
      where: { id },
      select: {
        id: true,
        derivedSource: true,
        resumeVersion: {
          select: {
            originalName: true,
          },
        },
      },
    });
  }

  findCompiledPdf(id: string) {
    return this.prisma.cvAnalysis.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        compiledPdfFile: true,
        resumeVersion: {
          select: {
            originalName: true,
          },
        },
      },
    });
  }

  async select(applicationId: string, analysisId: string) {
    const [application, analysis] = await Promise.all([
      this.prisma.application.findUnique({
        where: { id: applicationId },
        select: { id: true },
      }),
      this.prisma.cvAnalysis.findUnique({
        where: { id: analysisId },
        select: {
          id: true,
          applicationId: true,
          status: true,
          compiledPdfFile: true,
        },
      }),
    ]);

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (!analysis) {
      throw new NotFoundException('CV analysis not found.');
    }

    if (analysis.applicationId !== application.id) {
      throw new UnprocessableEntityException(
        'CV analysis does not belong to this application.',
      );
    }

    if (
      analysis.status !== CvAnalysisStatus.READY ||
      !analysis.compiledPdfFile
    ) {
      throw new ConflictException(
        'Only a READY analysis with a compiled PDF can be selected.',
      );
    }

    try {
      this.compiledPdfStorage.getFile(analysis.compiledPdfFile);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new ConflictException('Compiled PDF is not available.');
      }

      throw error;
    }

    return this.prisma.application.update({
      where: { id: application.id },
      data: {
        selectedCvAnalysisId: analysis.id,
      },
      select: {
        id: true,
        selectedCvAnalysisId: true,
        updatedAt: true,
      },
    });
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
