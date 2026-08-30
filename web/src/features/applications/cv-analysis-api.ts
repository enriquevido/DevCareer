import { apiRequest } from "../../lib/api-client";
import type { CvAnalysisSummary } from "../../types/api";

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
  const encodedApplicationId = encodeURIComponent(applicationId);

  return apiRequest<CvAnalysisSummary[]>(
    `/applications/${encodedApplicationId}/cv-analyses`,
  );
}
