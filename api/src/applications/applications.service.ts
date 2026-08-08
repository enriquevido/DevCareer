import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateApplicationDto) {
    return this.prisma.application.create({ data: dto });
  }

  findAll() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: { events: true },
    });
  }

  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: { events: true, suggestions: true },
    });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) return null;
    return this.prisma.application.update({ where: { id }, data: dto });
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
