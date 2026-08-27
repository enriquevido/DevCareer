import { Module } from '@nestjs/common';
import { CompiledPdfStorage } from './compiled-pdf.storage';
import { LatexCompilationClient } from './latex-compilation.client';

@Module({
  providers: [LatexCompilationClient, CompiledPdfStorage],
  exports: [LatexCompilationClient, CompiledPdfStorage],
})
export class LatexModule {}
