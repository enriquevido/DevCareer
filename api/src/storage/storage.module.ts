import { Module } from '@nestjs/common';
import { CompiledPdfStorage } from './compiled-pdf.storage';

@Module({
  providers: [CompiledPdfStorage],
  exports: [CompiledPdfStorage],
})
export class StorageModule {}
