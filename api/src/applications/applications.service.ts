import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
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

  remove(id: string) {
    return this.prisma.application.delete({ where: { id } });
  }
}
