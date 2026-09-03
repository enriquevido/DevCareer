import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CvAnalysisStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { CompiledPdfStorage } from '../storage/compiled-pdf.storage';

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
    private readonly compiledPdfStorage: CompiledPdfStorage,
  ) {}

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
}
