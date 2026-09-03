import type { CvAnalysisMessage } from '../domain/cv-analysis.types';

export const CV_ANALYSIS_PROVIDER = Symbol('CV_ANALYSIS_PROVIDER');

export type CvAnalysisProviderResponse = {
  model: string;
  content: string;
};

export interface CvAnalysisProvider {
  readonly model: string;

  generate(
    messages: readonly CvAnalysisMessage[],
  ): Promise<CvAnalysisProviderResponse>;
}
