import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CompiledPdfStorage } from '../storage/compiled-pdf.storage';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly compiledPdfStorage: CompiledPdfStorage,
  ) {}

  async create(dto: CreateApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.create({ data: dto });

      await tx.timelineEvent.create({
        data: {
          applicationId: application.id,
          status: application.status,
        },
      });

      return application;
    });
  }

  findAll(status?: ApplicationStatus, search?: string) {
    return this.prisma.application.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { company: { contains: search, mode: 'insensitive' } },
                { jobTitle: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { events: true },
    });
  }

  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: { events: true },
    });
  }

  update(id: string, dto: UpdateApplicationDto) {
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  changeStatus(id: string, dto: UpdateStatusDto) {
    return this.prisma.$transaction([
      this.prisma.application.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.timelineEvent.create({
        data: {
          applicationId: id,
          status: dto.status,
          note: dto.note,
        },
      }),
    ]);
  }

  async remove(id: string) {
    const analyses = await this.prisma.cvAnalysis.findMany({
      where: {
        applicationId: id,
        compiledPdfFile: { not: null },
      },
      select: {
        compiledPdfFile: true,
      },
    });

    const application = await this.prisma.application.delete({
      where: { id },
    });
    const filenames = analyses.flatMap(({ compiledPdfFile }) =>
      compiledPdfFile ? [compiledPdfFile] : [],
    );
    const cleanupResults = await Promise.allSettled(
      filenames.map((filename) => this.compiledPdfStorage.remove(filename)),
    );
    const failedCleanupCount = cleanupResults.filter(
      (result) => result.status === 'rejected',
    ).length;

    if (failedCleanupCount > 0) {
      this.logger.warn(
        `Could not remove ${failedCleanupCount} generated PDF file(s) for application ${id}.`,
      );
    }

    return application;
  }
}
