import { Module } from '@nestjs/common';
import { LatexCompilationClient } from './latex-compilation.client';

@Module({
  providers: [LatexCompilationClient],
  exports: [LatexCompilationClient],
})
export class LatexModule {}
