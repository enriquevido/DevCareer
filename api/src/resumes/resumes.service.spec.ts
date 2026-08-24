import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import type { ValidatedResumeUpload } from './resume-upload.validator';
import { ResumesService } from './resumes.service';

type AsyncOperation = (...args: unknown[]) => Promise<unknown>;

const createAsyncMock = () => jest.fn<AsyncOperation>();

const createPrismaMock = () => ({
  resumeVersion: {
    upsert: createAsyncMock(),
    findFirst: createAsyncMock(),
    findUnique: createAsyncMock(),
  },
});

type PrismaMock = ReturnType<typeof createPrismaMock>;

const METADATA_SELECT = {
  id: true,
  originalName: true,
  sha256: true,
  createdAt: true,
};

const SOURCE_SELECT = {
  ...METADATA_SELECT,
  source: true,
};

describe('ResumesService', () => {
  let prisma: PrismaMock;
  let service: ResumesService;

  const upload: ValidatedResumeUpload = {
    originalName: 'resume.tex',
    source: 'resume source',
    size: 13,
  };

  const metadata = {
    id: 'resume-1',
    originalName: upload.originalName,
    sha256: 'decff226a47a45f44b318bedd9678eefe93f9856ac1caebd6580d86d436563e1',
    createdAt: new Date('2026-08-23T10:00:00Z'),
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ResumesService(prisma as unknown as PrismaService);
  });

  describe('createOrReuse', () => {
    it('upserts a version by the SHA-256 of its source', async () => {
      prisma.resumeVersion.upsert.mockResolvedValue(metadata);

      const result = await service.createOrReuse(upload);

      expect(prisma.resumeVersion.upsert).toHaveBeenCalledWith({
        where: {
          sha256: metadata.sha256,
        },
        update: {},
        create: {
          originalName: upload.originalName,
          source: upload.source,
          sha256: metadata.sha256,
        },
        select: METADATA_SELECT,
      });
      expect(result).toEqual(metadata);
    });
  });

  describe('findCurrent', () => {
    it('returns the newest version metadata', async () => {
      prisma.resumeVersion.findFirst.mockResolvedValue(metadata);

      const result = await service.findCurrent();

      expect(prisma.resumeVersion.findFirst).toHaveBeenCalledWith({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: METADATA_SELECT,
      });
      expect(result).toEqual(metadata);
    });

    it('returns null when no version exists', async () => {
      prisma.resumeVersion.findFirst.mockResolvedValue(null);

      const result = await service.findCurrent();

      expect(result).toBeNull();
    });
  });

  describe('findSourceById', () => {
    it('returns metadata and source for an exact version', async () => {
      const resumeWithSource = {
        ...metadata,
        source: upload.source,
      };

      prisma.resumeVersion.findUnique.mockResolvedValue(resumeWithSource);

      const result = await service.findSourceById(metadata.id);

      expect(prisma.resumeVersion.findUnique).toHaveBeenCalledWith({
        where: {
          id: metadata.id,
        },
        select: SOURCE_SELECT,
      });
      expect(result).toEqual(resumeWithSource);
    });
  });
});
