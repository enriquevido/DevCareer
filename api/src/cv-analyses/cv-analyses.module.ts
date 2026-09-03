import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma/prisma.module';
import { LatexModule } from '../integrations/latex/latex.module';
import { StorageModule } from '../storage/storage.module';
import { CvAnalysisGenerationService } from './application/cv-analysis-generation.service';
import { CvAnalysesController } from './cv-analyses.controller';
import { CvAnalysesService } from './cv-analyses.service';
import { CV_ANALYSIS_PROVIDER } from './providers/cv-analysis.provider';
import { DeepSeekCvAnalysisProvider } from './providers/deepseek-cv-analysis.provider';

@Module({
  imports: [PrismaModule, LatexModule, StorageModule],
  controllers: [CvAnalysesController],
  providers: [
    CvAnalysesService,
    CvAnalysisGenerationService,
    DeepSeekCvAnalysisProvider,
    {
      provide: CV_ANALYSIS_PROVIDER,
      useExisting: DeepSeekCvAnalysisProvider,
    },
  ],
})
export class CvAnalysesModule {}
