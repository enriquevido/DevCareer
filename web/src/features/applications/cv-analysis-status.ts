import type { CvAnalysisRecord, CvAnalysisStatus } from "../../types/api";

export type CvAnalysisStatusPresentation = {
  badgeClassName: string;
  description: string;
  dotClassName: string;
  label: string;
};

type CvAnalysisArtifactState = Pick<
  CvAnalysisRecord,
  "compiledPdfFile" | "derivedSource" | "status"
>;

const CV_ANALYSIS_STATUS_PRESENTATION = {
  PROCESSING: {
    label: "En proceso",
    description: "El análisis y la generación del documento siguen en curso.",
    badgeClassName: "border-warning/40 bg-warning/10 text-warning",
    dotClassName: "bg-warning",
  },
  READY: {
    label: "Listo",
    description:
      "El resultado cumple las validaciones y el PDF está disponible.",
    badgeClassName: "border-success/40 bg-success/10 text-success",
    dotClassName: "bg-success",
  },
  AI_FAILED: {
    label: "Falló el análisis",
    description: "No se pudo producir un resultado confiable.",
    badgeClassName: "border-danger/40 bg-danger/10 text-danger",
    dotClassName: "bg-danger",
  },
  COMPILE_FAILED: {
    label: "PDF no disponible",
    description:
      "El resultado existe, pero la compilación o validación final no produjo un PDF utilizable.",
    badgeClassName: "border-danger/40 bg-danger/10 text-danger",
    dotClassName: "bg-danger",
  },
} satisfies Record<CvAnalysisStatus, CvAnalysisStatusPresentation>;

export function getCvAnalysisStatusPresentation(
  status: CvAnalysisStatus,
): CvAnalysisStatusPresentation {
  return CV_ANALYSIS_STATUS_PRESENTATION[status];
}

export function shouldPollCvAnalysis(status: CvAnalysisStatus): boolean {
  return status === "PROCESSING";
}

export function canDownloadCvAnalysisSource(
  analysis: CvAnalysisArtifactState,
): boolean {
  return Boolean(analysis.derivedSource?.trim());
}

export function canDownloadCvAnalysisPdf(
  analysis: CvAnalysisArtifactState,
): boolean {
  return (
    analysis.status === "READY" && Boolean(analysis.compiledPdfFile?.trim())
  );
}

export function canSelectCvAnalysis(
  analysis: CvAnalysisArtifactState,
): boolean {
  return canDownloadCvAnalysisPdf(analysis);
}
