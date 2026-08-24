import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CvAnalysesService } from './cv-analyses.service';
import { GenerateCvAnalysisDto } from './dto/generate-cv-analysis.dto';

@Controller()
export class CvAnalysesController {
  constructor(private readonly cvAnalysesService: CvAnalysesService) {}

  @Post('applications/:applicationId/cv-analyses')
  generate(
    @Param('applicationId') applicationId: string,
    @Body() dto: GenerateCvAnalysisDto,
  ) {
    return this.cvAnalysesService.generate(applicationId, dto.resumeVersionId);
  }

  @Get('applications/:applicationId/cv-analyses')
  findAllByApplication(@Param('applicationId') applicationId: string) {
    return this.cvAnalysesService.findAllByApplication(applicationId);
  }

  @Get('cv-analyses/:id')
  async findOne(@Param('id') id: string) {
    const analysis = await this.cvAnalysesService.findOne(id);

    if (!analysis) {
      throw new NotFoundException('CV analysis not found.');
    }

    return analysis;
  }

  @Get('cv-analyses/:id/source')
  async downloadSource(@Param('id') id: string, @Res() response: Response) {
    const analysis = await this.cvAnalysesService.findDerivedSource(id);

    if (!analysis) {
      throw new NotFoundException('CV analysis not found.');
    }

    if (!analysis.derivedSource) {
      throw new ConflictException(
        'Derived source is not available for this analysis.',
      );
    }

    const baseName = analysis.resumeVersion.originalName.replace(/\.tex$/i, '');
    const fileName = `${baseName}-tailored.tex`;
    const encodedFileName = encodeURIComponent(fileName);

    response.set({
      'Content-Type': 'application/x-tex; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      'Content-Length': Buffer.byteLength(
        analysis.derivedSource,
        'utf8',
      ).toString(),
    });

    response.send(analysis.derivedSource);
  }
}
