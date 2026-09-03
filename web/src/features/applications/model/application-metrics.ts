import type { ApplicationRecord } from "@/domain/application";

export type ApplicationMetrics = {
  total: number;
  drafts: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
};

export function calculateApplicationMetrics(
  applications: readonly ApplicationRecord[],
): ApplicationMetrics {
  const metrics: ApplicationMetrics = {
    total: applications.length,
    drafts: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
  };

  for (const application of applications) {
    switch (application.status) {
      case "DRAFT":
        metrics.drafts += 1;
        break;

      case "APPLIED":
        metrics.applied += 1;
        break;

      case "INTERVIEW":
        metrics.interviews += 1;
        break;

      case "OFFER":
        metrics.offers += 1;
        break;

      case "REJECTED":
        metrics.rejected += 1;
        break;

      case "RESPONSE_RECEIVED":
      case "CLOSED":
        break;
    }
  }

  return metrics;
}
