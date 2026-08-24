import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CvAnalysisStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CV_ANALYSIS_PROVIDER,
  type CvAnalysisProvider,
} from './cv-analysis-provider';
import { buildCvAnalysisMessage } from './cv-analysis.prompt';
import { parseCvAnalysisResponse } from './cv-analysis-response.validator';
import { applyLatexReplacements } from './latex-replacement.engine';

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

@Injectable()
export class CvAnalysesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CV_ANALYSIS_PROVIDER)
    private readonly provider: CvAnalysisProvider,
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

    try {
      const providerResponse = await this.provider.generate(
        buildCvAnalysisMessage({
          company: application.company,
          jobTitle: application.jobTitle,
          jobDescription: application.description,
          resumeSource: resumeVersion.source,
        }),
      );

      const result = parseCvAnalysisResponse(providerResponse.content);

      const replacementResult = applyLatexReplacements(
        resumeVersion.source,
        result.recommendations,
      );

      return await this.prisma.cvAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: CvAnalysisStatus.READY,
          model: providerResponse.model,
          summaryEs: result.summaryEs,
          recommendations: {
            matchedKeywords: result.matchedKeywords,
            missingKeywords: result.missingKeywords,
            warningsEs: result.warningsEs,
            items: replacementResult.recommendations,
          },
          derivedSource: replacementResult.derivedSource,
          errorMessage: null,
        },
      });
    } catch (error: unknown) {
      return this.markAsAiFailed(analysis.id, getErrorMessage(error));
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

  private markAsAiFailed(analysisId: string, errorMessage: string) {
    return this.prisma.cvAnalysis.update({
      where: { id: analysisId },
      data: {
        status: CvAnalysisStatus.AI_FAILED,
        errorMessage,
      },
    });
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unknown AI analysis error.';
}
