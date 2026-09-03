export type CvAnalysisPromptInput = {
  company: string;
  jobTitle: string;
  jobDescription: string;
  resumeSource: string;
};

export type CvAnalysisMessage = {
  role: 'system' | 'user';
  content: string;
};

export type CvAnalysisRecommendation = {
  section: string;
  originalText: string;
  replacementText: string;
  rationaleEs: string;
  matchedKeywords: string[];
};

export type CvAnalysisResult = {
  summaryEs: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  warningsEs: string[];
  recommendations: CvAnalysisRecommendation[];
};
