import { Module } from '@nestjs/common';
import { CV_ANALYSIS_PROVIDER } from './cv-analysis-provider';
import { CvAnalysesController } from './cv-analyses.controller';
import { CvAnalysesService } from './cv-analyses.service';
import { DeepSeekCvAnalysisProvider } from './deepseek-cv-analysis.provider';

@Module({
  controllers: [CvAnalysesController],
  providers: [
    CvAnalysesService,
    DeepSeekCvAnalysisProvider,
    {
      provide: CV_ANALYSIS_PROVIDER,
      useExisting: DeepSeekCvAnalysisProvider,
    },
  ],
})
export class CvAnalysesModule {}
