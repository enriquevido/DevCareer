import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { MAX_RESUME_FILE_SIZE_BYTES } from './resume-upload.constants';
import {
  ResumeUploadValidationError,
  validateResumeUpload,
} from './resume-upload.validator';
import { ResumesService } from './resumes.service';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_RESUME_FILE_SIZE_BYTES,
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Resume file is required.');
    }

    const validateUpload = this.validateFile(file);

    return this.resumesService.createOrReuse(validateUpload);
  }

  @Get('current')
  async findCurrent() {
    const resume = await this.resumesService.findCurrent();

    if (!resume) {
      throw new NotFoundException('No resume version is available.');
    }

    return resume;
  }

  @Get(':id/source')
  async downloadSource(@Param('id') id: string, @Res() response: Response) {
    const resume = await this.resumesService.findSourceById(id);

    if (!resume) {
      throw new NotFoundException('Resume version not found');
    }

    const encodedFileName = encodeURIComponent(resume.originalName);

    response.set({
      'Content-Type': 'application/x-tex; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      'Content-Length': Buffer.byteLength(resume.source, 'utf-8').toString(),
    });

    response.send(resume.source);
  }

  private validateFile(file: Express.Multer.File) {
    try {
      return validateResumeUpload({
        originalName: file.originalname,
        buffer: file.buffer,
      });
    } catch (error: unknown) {
      if (error instanceof ResumeUploadValidationError) {
        throw new BadRequestException({
          statusCode: 400,
          code: error.code,
          message: error.message,
        });
      }

      throw error;
    }
  }
}
