import type { CvAnalysisStatus } from "../../types/api";

export type CvAnalysisStatusPresentation = {
  badgeClassName: string;
  dotClassName: string;
  label: string;
};

const CV_ANALYSIS_STATUS_PRESENTATION = {
  PROCESSING: {
    label: "En proceso",
    badgeClassName: "border-warning/40 bg-warning/10 text-warning",
    dotClassName: "bg-warning",
  },
  READY: {
    label: "Listo",
    badgeClassName: "border-success/40 bg-success/10 text-success",
    dotClassName: "bg-success",
  },
  AI_FAILED: {
    label: "Falló el análisis",
    badgeClassName: "border-danger/40 bg-danger/10 text-danger",
    dotClassName: "bg-danger",
  },
  COMPILE_FAILED: {
    label: "Falló la compilación",
    badgeClassName: "border-danger/40 bg-danger/10 text-danger",
    dotClassName: "bg-danger",
  },
} satisfies Record<CvAnalysisStatus, CvAnalysisStatusPresentation>;

export function getCvAnalysisStatusPresentation(
  status: CvAnalysisStatus,
): CvAnalysisStatusPresentation {
  return CV_ANALYSIS_STATUS_PRESENTATION[status];
}
