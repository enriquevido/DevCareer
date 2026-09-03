import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
