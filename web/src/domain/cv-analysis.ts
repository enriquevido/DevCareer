import type { IsoDateString } from "./common";
import type { ResumeVersion } from "./resume";

export const CV_ANALYSIS_STATUSES = [
  "PROCESSING",
  "READY",
  "AI_FAILED",
  "COMPILE_FAILED",
] as const;

export type CvAnalysisStatus = (typeof CV_ANALYSIS_STATUSES)[number];

export const REPLACEMENT_STATUSES = ["APPLIED", "REJECTED"] as const;

export type ReplacementStatus = (typeof REPLACEMENT_STATUSES)[number];

export const REPLACEMENT_REJECTION_REASONS = [
  "ORIGINAL_NOT_FOUND",
  "ORIGINAL_NOT_UNIQUE",
  "IDENTICAL_REPLACEMENT",
  "OVERLAPPING_REPLACEMENT",
] as const;

export type ReplacementRejectionReason =
  (typeof REPLACEMENT_REJECTION_REASONS)[number];

export type CvRecommendation = {
  section: string;
  originalText: string;
  replacementText: string;
  rationaleEs: string;
  matchedKeywords: string[];
  status: ReplacementStatus;
  rejectionReason: ReplacementRejectionReason | null;
};

export type CvAnalysisRecommendations = {
  matchedKeywords: string[];
  missingKeywords: string[];
  warningsEs: string[];
  items: CvRecommendation[];
};

export type CvAnalysisRecord = {
  id: string;
  applicationId: string;
  resumeVersionId: string;
  status: CvAnalysisStatus;
  model: string;
  summaryEs: string | null;
  recommendations: CvAnalysisRecommendations | null;
  derivedSource: string | null;
  compiledPdfFile: string | null;
  errorMessage: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type CvAnalysisSummary = Pick<
  CvAnalysisRecord,
  | "id"
  | "applicationId"
  | "resumeVersionId"
  | "status"
  | "model"
  | "summaryEs"
  | "errorMessage"
  | "createdAt"
  | "updatedAt"
>;

export type CvAnalysis = CvAnalysisRecord & {
  application: {
    id: string;
    company: string;
    jobTitle: string;
  };
  resumeVersion: ResumeVersion;
};

export type GenerateCvAnalysisInput = {
  resumeVersionId?: string;
};

export type SelectedCvAnalysis = {
  id: string;
  selectedCvAnalysisId: string;
  updatedAt: IsoDateString;
};
