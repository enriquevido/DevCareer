import { Link } from "react-router-dom";
import type { CvAnalysis } from "@/domain/cv-analysis";
import { formatDateTime } from "@/shared/lib/date-format";
import {
  getCvAnalysisPdfDownloadUrl,
  getCvAnalysisSourceDownloadUrl,
} from "./cv-analysis-api";
import {
  canDownloadCvAnalysisPdf,
  canDownloadCvAnalysisSource,
  canSelectCvAnalysis,
  getCvAnalysisStatusPresentation,
} from "./cv-analysis-status";
import { CvAnalysisStatusBadge } from "./cv-analysis-status-badge";

type CvAnalysisDetailHeaderProps = {
  analysis: CvAnalysis;
  isSelected: boolean;
  isSelecting: boolean;
  onSelect: () => void;
};

const SECONDARY_ACTION_CLASS_NAME = [
  "inline-flex",
  "h-9",
  "items-center",
  "justify-center",
  "rounded-sm",
  "border",
  "border-line-strong",
  "bg-transparent",
  "px-3",
  "text-sm",
  "font-medium",
  "text-foreground",
  "no-underline",
  "transition-colors",
  "duration-150",
  "hover:bg-surface-hover",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-accent",
  "motion-reduce:transition-none",
].join(" ");

export function CvAnalysisDetailHeader({
  analysis,
  isSelected,
  isSelecting,
  onSelect,
}: CvAnalysisDetailHeaderProps) {
  const statusPresentation = getCvAnalysisStatusPresentation(analysis.status);

  const canDownloadSource = canDownloadCvAnalysisSource(analysis);

  const canDownloadPdf = canDownloadCvAnalysisPdf(analysis);

  const canSelect = !isSelected && canSelectCvAnalysis(analysis);

  return (
    <header className="border-b border-line pb-5">
      <Link
        className={[
          "inline-flex",
          "text-sm",
          "text-foreground-muted",
          "no-underline",
          "underline-offset-4",
          "hover:text-foreground",
          "hover:underline",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent",
        ].join(" ")}
        to={`/applications/${analysis.application.id}`}
      >
        Volver a la postulación
      </Link>

      <div
        className={[
          "mt-4",
          "flex",
          "flex-col",
          "gap-4",
          "sm:flex-row",
          "sm:items-start",
          "sm:justify-between",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Análisis del CV
            </h1>

            <CvAnalysisStatusBadge status={analysis.status} />
          </div>

          <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
            {analysis.application.company}
            {" · "}
            {analysis.application.jobTitle}
          </p>

          <p className="mt-2 text-sm leading-6 text-foreground-subtle">
            {statusPresentation.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {canDownloadSource ? (
            <a
              className={SECONDARY_ACTION_CLASS_NAME}
              href={getCvAnalysisSourceDownloadUrl(analysis.id)}
            >
              Descargar .tex
            </a>
          ) : null}

          {canDownloadPdf ? (
            <a
              className={SECONDARY_ACTION_CLASS_NAME}
              href={getCvAnalysisPdfDownloadUrl(analysis.id)}
            >
              Descargar PDF
            </a>
          ) : null}

          {isSelected ? (
            <span className="inline-flex h-9 items-center text-sm font-medium text-success">
              CV seleccionado
            </span>
          ) : canSelect ? (
            <button
              className={[
                "inline-flex",
                "h-9",
                "items-center",
                "justify-center",
                "rounded-sm",
                "border",
                "border-accent",
                "bg-accent",
                "px-3",
                "text-sm",
                "font-medium",
                "text-white",
                "transition-colors",
                "duration-150",
                "hover:border-accent-hover",
                "hover:bg-accent-hover",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent-hover",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-canvas",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                "motion-reduce:transition-none",
              ].join(" ")}
              disabled={isSelecting}
              onClick={onSelect}
              type="button"
            >
              {isSelecting ? "Seleccionando…" : "Seleccionar este CV"}
            </button>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid border-y border-line sm:grid-cols-3">
        <div className="py-3 sm:pr-4">
          <dt className="text-xs font-medium text-foreground-subtle">Modelo</dt>

          <dd className="mt-1 break-all font-mono text-sm text-foreground">
            {analysis.model}
          </dd>
        </div>

        <div className="border-t border-line py-3 sm:border-t-0 sm:border-l sm:px-4">
          <dt className="text-xs font-medium text-foreground-subtle">
            Documento fuente
          </dt>

          <dd className="mt-1 break-words text-sm text-foreground">
            {analysis.resumeVersion.originalName}
          </dd>
        </div>

        <div className="border-t border-line py-3 sm:border-t-0 sm:border-l sm:pl-4">
          <dt className="text-xs font-medium text-foreground-subtle">Creado</dt>

          <dd className="mt-1 text-sm text-foreground">
            <time dateTime={analysis.createdAt}>
              {formatDateTime(analysis.createdAt)}
            </time>
          </dd>
        </div>
      </dl>
    </header>
  );
}
