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
import { CvAnalysisStatus } from '@prisma/client';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { CompiledPdfStorage } from '../latex/compiled-pdf.storage';
import { CvAnalysesService } from './cv-analyses.service';
import { GenerateCvAnalysisDto } from './dto/generate-cv-analysis.dto';

@Controller()
export class CvAnalysesController {
  constructor(
    private readonly cvAnalysesService: CvAnalysesService,
    private readonly compiledPdfStorage: CompiledPdfStorage,
  ) {}

  @Post('applications/:applicationId/cv-analyses')
  generate(
    @Param('applicationId')
    applicationId: string,
    @Body() dto: GenerateCvAnalysisDto,
  ) {
    return this.cvAnalysesService.generate(applicationId, dto.resumeVersionId);
  }

  @Get('applications/:applicationId/cv-analyses')
  findAllByApplication(
    @Param('applicationId')
    applicationId: string,
  ) {
    return this.cvAnalysesService.findAllByApplication(applicationId);
  }

  @Post('applications/:applicationId/cv-analyses/:analysisId/select')
  select(
    @Param('applicationId')
    applicationId: string,
    @Param('analysisId') analysisId: string,
  ) {
    return this.cvAnalysesService.select(applicationId, analysisId);
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

  @Get('cv-analyses/:id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() response: Response) {
    const analysis = await this.cvAnalysesService.findCompiledPdf(id);

    if (!analysis) {
      throw new NotFoundException('CV analysis not found.');
    }

    if (
      analysis.status !== CvAnalysisStatus.READY ||
      !analysis.compiledPdfFile
    ) {
      throw new ConflictException(
        'Compiled PDF is not available for this analysis.',
      );
    }

    const filePath = this.compiledPdfStorage.getFile(analysis.compiledPdfFile);
    const baseName = analysis.resumeVersion.originalName.replace(/\.tex$/i, '');
    const fileName = `${baseName}-tailored.pdf`;
    const encodedFileName = encodeURIComponent(fileName);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      'Cache-Control': 'no-store',
    });

    createReadStream(filePath).pipe(response);
  }
}
