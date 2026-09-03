import { apiRequest, getApiUrl } from "@/shared/api/http-client";
import type {
  CvAnalysis,
  CvAnalysisRecord,
  CvAnalysisSummary,
  GenerateCvAnalysisInput,
  SelectedCvAnalysis,
} from "@/domain/cv-analysis";

export const cvAnalysisQueryKeys = {
  all: ["cv-analyses"] as const,

  lists: () => [...cvAnalysisQueryKeys.all, "list"] as const,

  listByApplication: (applicationId: string) =>
    [...cvAnalysisQueryKeys.lists(), "application", applicationId] as const,

  details: () => [...cvAnalysisQueryKeys.all, "detail"] as const,

  detail: (analysisId: string) =>
    [...cvAnalysisQueryKeys.details(), analysisId] as const,
};

export function fetchApplicationCvAnalyses(
  applicationId: string,
): Promise<CvAnalysisSummary[]> {
  return apiRequest<CvAnalysisSummary[]>(
    buildApplicationCvAnalysesPath(applicationId),
  );
}

export function generateApplicationCvAnalysis(
  applicationId: string,
  input: GenerateCvAnalysisInput,
): Promise<CvAnalysisRecord> {
  return apiRequest<CvAnalysisRecord>(
    buildApplicationCvAnalysesPath(applicationId),
    {
      method: "POST",
      body: input,
    },
  );
}

export function fetchCvAnalysis(analysisId: string): Promise<CvAnalysis> {
  return apiRequest<CvAnalysis>(buildCvAnalysisPath(analysisId));
}

export function selectCvAnalysis(
  applicationId: string,
  analysisId: string,
): Promise<SelectedCvAnalysis> {
  const encodedAnalysisId = encodeURIComponent(analysisId);

  return apiRequest<SelectedCvAnalysis>(
    `${buildApplicationCvAnalysesPath(
      applicationId,
    )}/${encodedAnalysisId}/select`,
    {
      method: "POST",
    },
  );
}

export function getCvAnalysisSourceDownloadUrl(analysisId: string): string {
  return getApiUrl(`${buildCvAnalysisPath(analysisId)}/source`);
}

export function getCvAnalysisPdfDownloadUrl(analysisId: string): string {
  return getApiUrl(`${buildCvAnalysisPath(analysisId)}/pdf`);
}

function buildApplicationCvAnalysesPath(applicationId: string): string {
  const encodedApplicationId = encodeURIComponent(applicationId);

  return `/applications/${encodedApplicationId}/cv-analyses`;
}

function buildCvAnalysisPath(analysisId: string): string {
  const encodedAnalysisId = encodeURIComponent(analysisId);

  return `/cv-analyses/${encodedAnalysisId}`;
}
