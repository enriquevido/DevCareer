import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async update(id: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) return null;

    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async changeStatus(id: string, dto: UpdateStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) return null;

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

  remove(id: string) {
    return this.prisma.application.delete({ where: { id } });
  }
}
