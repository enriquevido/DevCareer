import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { ValidatedResumeUpload } from './resume-upload.validator';

const RESUME_VERSION_METADATA_SELECT = {
  id: true,
  originalName: true,
  sha256: true,
  createdAt: true,
} as const;

const RESUME_VERSION_SOURCE_SELECT = {
  ...RESUME_VERSION_METADATA_SELECT,
  source: true,
} as const;

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  createOrReuse(upload: ValidatedResumeUpload) {
    const sha256 = this.calculateSha256(upload.source);

    return this.prisma.resumeVersion.upsert({
      where: { sha256 },
      update: {},
      create: {
        originalName: upload.originalName,
        source: upload.source,
        sha256,
      },
      select: RESUME_VERSION_METADATA_SELECT,
    });
  }

  findCurrent() {
    return this.prisma.resumeVersion.findFirst({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: RESUME_VERSION_METADATA_SELECT,
    });
  }

  findSourceById(id: string) {
    return this.prisma.resumeVersion.findUnique({
      where: { id },
      select: RESUME_VERSION_SOURCE_SELECT,
    });
  }

  private calculateSha256(source: string): string {
    return createHash('sha256').update(source, 'utf8').digest('hex');
  }
}
