import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { CvAnalysisStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CvAnalysisProvider } from './cv-analysis-provider';
import { CvAnalysesService } from './cv-analyses.service';

type AsyncOperation = (...args: unknown[]) => Promise<unknown>;

const createAsyncMock = () => jest.fn<AsyncOperation>();

const createPrismaMock = () => ({
  application: {
    findUnique: createAsyncMock(),
  },
  resumeVersion: {
    findUnique: createAsyncMock(),
  },
  cvAnalysis: {
    create: createAsyncMock(),
    update: createAsyncMock(),
    findMany: createAsyncMock(),
    findUnique: createAsyncMock(),
  },
});

const createProviderMock = () => ({
  model: 'deepseek-v4-flash',
  generate: createAsyncMock(),
});

type PrismaMock = ReturnType<typeof createPrismaMock>;
type ProviderMock = ReturnType<typeof createProviderMock>;

describe('CvAnalysesService', () => {
  let prisma: PrismaMock;
  let provider: ProviderMock;
  let service: CvAnalysesService;

  const application = {
    id: 'application-1',
    company: 'Northstar Labs',
    jobTitle: 'Backend Engineer',
    description: 'Seeking a TypeScript engineer to build APIs.',
  };

  const resumeVersion = {
    id: 'resume-1',
    source: String.raw`\begin{document}
  Built TypeScript APIs for internal services.
  \end{document}`,
  };

  const processingAnalysis = {
    id: 'analysis-1',
  };

  const providerResult = {
    summaryEs: 'El CV contiene experiencia relevante en TypeScript.',
    matchedKeywords: ['TypeScript', 'APIs'],
    missingKeywords: [],
    warningsEs: [],
    recommendations: [
      {
        section: 'Experience',
        originalText: 'Built TypeScript APIs for internal services.',
        replacementText: 'Built internal service APIs with TypeScript.',
        rationaleEs: 'Prioriza TypeScript y APIs sin agregar experiencia.',
        matchedKeywords: ['TypeScript', 'APIs'],
      },
    ],
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    provider = createProviderMock();

    service = new CvAnalysesService(
      prisma as unknown as PrismaService,
      provider as unknown as CvAnalysisProvider,
    );

    prisma.application.findUnique.mockResolvedValue(application);
    prisma.resumeVersion.findUnique.mockResolvedValue(resumeVersion);
    prisma.cvAnalysis.create.mockResolvedValue(processingAnalysis);
  });

  it('persists PROCESSING before requesting the analysis', async () => {
    provider.generate.mockResolvedValue({
      model: provider.model,
      content: JSON.stringify(providerResult),
    });
    prisma.cvAnalysis.update.mockResolvedValue({
      id: processingAnalysis.id,
      status: CvAnalysisStatus.READY,
    });

    await service.generate(application.id, resumeVersion.id);

    expect(prisma.cvAnalysis.create).toHaveBeenCalledWith({
      data: {
        applicationId: application.id,
        resumeVersionId: resumeVersion.id,
        status: CvAnalysisStatus.PROCESSING,
        model: provider.model,
      },
      select: {
        id: true,
      },
    });

    expect(prisma.cvAnalysis.create.mock.invocationCallOrder[0]).toBeLessThan(
      provider.generate.mock.invocationCallOrder[0],
    );
  });

  it('persists the derived source and transitions to READY', async () => {
    provider.generate.mockResolvedValue({
      model: 'deepseek-v4-flash-202608',
      content: JSON.stringify(providerResult),
    });

    const readyAnalysis = {
      id: processingAnalysis.id,
      status: CvAnalysisStatus.READY,
    };

    prisma.cvAnalysis.update.mockResolvedValue(readyAnalysis);

    const result = await service.generate(application.id, resumeVersion.id);

    expect(prisma.cvAnalysis.update).toHaveBeenCalledWith({
      where: {
        id: processingAnalysis.id,
      },
      data: {
        status: CvAnalysisStatus.READY,
        model: 'deepseek-v4-flash-202608',
        summaryEs: providerResult.summaryEs,
        recommendations: {
          matchedKeywords: providerResult.matchedKeywords,
          missingKeywords: providerResult.missingKeywords,
          warningsEs: providerResult.warningsEs,
          items: [
            {
              ...providerResult.recommendations[0],
              status: 'APPLIED',
              rejectionReason: null,
            },
          ],
        },
        derivedSource: String.raw`\begin{document}
  Built internal service APIs with TypeScript.
  \end{document}`,
        errorMessage: null,
      },
    });
    expect(result).toEqual(readyAnalysis);
  });

  it('transitions to AI_FAILED when the provider fails', async () => {
    provider.generate.mockRejectedValue(new Error('DeepSeek unavailable.'));

    const failedAnalysis = {
      id: processingAnalysis.id,
      status: CvAnalysisStatus.AI_FAILED,
      errorMessage: 'DeepSeek unavailable.',
    };

    prisma.cvAnalysis.update.mockResolvedValue(failedAnalysis);

    const result = await service.generate(application.id, resumeVersion.id);

    expect(prisma.cvAnalysis.update).toHaveBeenCalledWith({
      where: {
        id: processingAnalysis.id,
      },
      data: {
        status: CvAnalysisStatus.AI_FAILED,
        errorMessage: 'DeepSeek unavailable.',
      },
    });
    expect(result).toEqual(failedAnalysis);
  });

  it('transitions to AI_FAILED for an empty AI response', async () => {
    provider.generate.mockResolvedValue({
      model: provider.model,
      content: '   ',
    });

    prisma.cvAnalysis.update.mockResolvedValue({
      id: processingAnalysis.id,
      status: CvAnalysisStatus.AI_FAILED,
    });

    await service.generate(application.id, resumeVersion.id);

    expect(prisma.cvAnalysis.update).toHaveBeenCalledWith({
      where: {
        id: processingAnalysis.id,
      },
      data: {
        status: CvAnalysisStatus.AI_FAILED,
        errorMessage: 'AI response must not be empty.',
      },
    });
  });

  it('does not create an analysis without a job description', async () => {
    prisma.application.findUnique.mockResolvedValue({
      ...application,
      description: '   ',
    });

    await expect(
      service.generate(application.id, resumeVersion.id),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);

    expect(prisma.cvAnalysis.create).not.toHaveBeenCalled();
    expect(provider.generate).not.toHaveBeenCalled();
  });
});
