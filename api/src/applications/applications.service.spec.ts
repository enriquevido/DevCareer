import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

type AsyncOperation = (...args: unknown[]) => Promise<unknown>;

const createAsyncMock = () => jest.fn<AsyncOperation>();

const createPrismaMock = () => ({
  application: {
    create: createAsyncMock(),
    findMany: createAsyncMock(),
    findUnique: createAsyncMock(),
    update: createAsyncMock(),
    delete: createAsyncMock(),
  },
  timelineEvent: {
    create: createAsyncMock(),
  },
  $transaction: createAsyncMock(),
});

type PrismaMock = ReturnType<typeof createPrismaMock>;
type TransactionCallback = (transaction: PrismaMock) => Promise<unknown>;

describe('ApplicationsService', () => {
  let prisma: PrismaMock;
  let service: ApplicationsService;

  const draftApplication = {
    id: 'application-1',
    company: 'Northstar Labs',
    jobTitle: 'Frontend Engineer Intern',
    status: ApplicationStatus.DRAFT,
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ApplicationsService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates the application and its initial timeline event in one transaction', async () => {
      const dto = {
        company: draftApplication.company,
        jobTitle: draftApplication.jobTitle,
      };

      prisma.application.create.mockResolvedValue(draftApplication);
      prisma.timelineEvent.create.mockResolvedValue({
        id: 'event-1',
        applicationId: draftApplication.id,
        status: ApplicationStatus.DRAFT,
      });

      prisma.$transaction.mockImplementation(async (...args: unknown[]) => {
        const callback = args[0] as TransactionCallback;

        return callback(prisma);
      });

      const result = await service.create(dto);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.application.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(prisma.timelineEvent.create).toHaveBeenCalledWith({
        data: {
          applicationId: draftApplication.id,
          status: ApplicationStatus.DRAFT,
        },
      });
      expect(result).toEqual(draftApplication);
    });
  });

  describe('findAll', () => {
    it('filters by status and searches company or job title', async () => {
      prisma.application.findMany.mockResolvedValue([draftApplication]);

      const result = await service.findAll(
        ApplicationStatus.INTERVIEW,
        'engineer',
      );

      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: {
          status: ApplicationStatus.INTERVIEW,
          OR: [
            {
              company: {
                contains: 'engineer',
                mode: 'insensitive',
              },
            },
            {
              jobTitle: {
                contains: 'engineer',
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { events: true },
      });
      expect(result).toEqual([draftApplication]);
    });

    it('lists every application when no filters are provided', async () => {
      prisma.application.findMany.mockResolvedValue([draftApplication]);

      await service.findAll();

      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: { events: true },
      });
    });
  });

  describe('findOne', () => {
    it('returns one application with its timeline events', async () => {
      prisma.application.findUnique.mockResolvedValue(draftApplication);

      const result = await service.findOne(draftApplication.id);

      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: draftApplication.id },
        include: { events: true },
      });
      expect(result).toEqual(draftApplication);
    });
  });

  describe('update', () => {
    it('returns null when the application does not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      const result = await service.update('missing-id', {
        company: 'Updated company',
      });

      expect(result).toBeNull();
      expect(prisma.application.update).not.toHaveBeenCalled();
    });

    it('updates an existing application', async () => {
      const updatedApplication = {
        ...draftApplication,
        company: 'Updated company',
      };

      prisma.application.findUnique.mockResolvedValue(draftApplication);
      prisma.application.update.mockResolvedValue(updatedApplication);

      const result = await service.update(draftApplication.id, {
        company: updatedApplication.company,
      });

      expect(prisma.application.update).toHaveBeenCalledWith({
        where: { id: draftApplication.id },
        data: { company: updatedApplication.company },
      });
      expect(result).toEqual(updatedApplication);
    });
  });

  describe('changeStatus', () => {
    it('returns null without a transaction when the application does not exist', async () => {
      prisma.application.findUnique.mockResolvedValue(null);

      const result = await service.changeStatus('missing-id', {
        status: ApplicationStatus.APPLIED,
      });

      expect(result).toBeNull();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.application.update).not.toHaveBeenCalled();
      expect(prisma.timelineEvent.create).not.toHaveBeenCalled();
    });

    it('updates the status and creates a timeline event transactionally', async () => {
      const updatedApplication = {
        ...draftApplication,
        status: ApplicationStatus.APPLIED,
      };
      const timelineEvent = {
        id: 'event-2',
        applicationId: draftApplication.id,
        status: ApplicationStatus.APPLIED,
        note: 'Application submitted',
      };

      prisma.application.findUnique.mockResolvedValue(draftApplication);
      prisma.application.update.mockResolvedValue(updatedApplication);
      prisma.timelineEvent.create.mockResolvedValue(timelineEvent);
      prisma.$transaction.mockResolvedValue([
        updatedApplication,
        timelineEvent,
      ]);

      const result = await service.changeStatus(draftApplication.id, {
        status: ApplicationStatus.APPLIED,
        note: timelineEvent.note,
      });

      expect(prisma.application.update).toHaveBeenCalledWith({
        where: { id: draftApplication.id },
        data: { status: ApplicationStatus.APPLIED },
      });
      expect(prisma.timelineEvent.create).toHaveBeenCalledWith({
        data: {
          applicationId: draftApplication.id,
          status: ApplicationStatus.APPLIED,
          note: timelineEvent.note,
        },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual([updatedApplication, timelineEvent]);
    });
  });

  describe('remove', () => {
    it('deletes the requested application', async () => {
      prisma.application.delete.mockResolvedValue(draftApplication);

      const result = await service.remove(draftApplication.id);

      expect(prisma.application.delete).toHaveBeenCalledWith({
        where: { id: draftApplication.id },
      });
      expect(result).toEqual(draftApplication);
    });
  });
});
