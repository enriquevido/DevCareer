import type { EvaluatedLatexReplacement } from './latex-replacement.engine';

export type CvAnalysisRecommendations = {
  matchedKeywords: string[];
  missingKeywords: string[];
  warningsEs: string[];
  items: EvaluatedLatexReplacement[];
};
