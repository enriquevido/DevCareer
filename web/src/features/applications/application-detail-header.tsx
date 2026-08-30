import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { ApplicationRecord } from "../../types/api";
import { getSafeApplicationUrl } from "./application-format";
import { ApplicationStatusBadge } from "./application-status-badge";

type ApplicationDetailHeaderProps = {
  application: ApplicationRecord;
  isGenerateActionDisabled?: boolean;
  isGeneratingAnalysis?: boolean;
  isStatusActionDisabled?: boolean;
  onChangeStatus: () => void;
  onGenerateAnalysis?: () => void;
};

export function ApplicationDetailHeader({
  application,
  isGenerateActionDisabled = false,
  isGeneratingAnalysis = false,
  isStatusActionDisabled = false,
  onChangeStatus,
  onGenerateAnalysis,
}: ApplicationDetailHeaderProps) {
  const safeJobUrl = getSafeApplicationUrl(application.jobUrl);

  return (
    <header className="border-b border-line pb-5">
      <div
        className={[
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
              {application.company}
            </h1>

            <ApplicationStatusBadge status={application.status} />
          </div>

          <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
            {application.jobTitle}
          </p>

          {safeJobUrl ? (
            <a
              className={[
                "mt-2",
                "inline-flex",
                "items-center",
                "gap-1.5",
                "text-sm",
                "text-accent-soft",
                "underline-offset-4",
                "hover:underline",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent",
              ].join(" ")}
              href={safeJobUrl}
              rel="noreferrer"
              target="_blank"
            >
              Abrir vacante original
              <ExternalLink
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={1.8}
              />
            </a>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            className={[
              "inline-flex",
              "h-9",
              "items-center",
              "justify-center",
              "rounded-sm",
              "border",
              "border-line-strong",
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
            ].join(" ")}
            to={`/applications/${application.id}/edit`}
          >
            Editar
          </Link>

          {onGenerateAnalysis ? (
            <button
              className={[
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
                "transition-colors",
                "duration-150",
                "hover:bg-surface-hover",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                "motion-reduce:transition-none",
              ].join(" ")}
              disabled={isGenerateActionDisabled || isGeneratingAnalysis}
              onClick={onGenerateAnalysis}
              type="button"
            >
              {isGeneratingAnalysis
                ? "Generando análisis…"
                : "Generar análisis"}
            </button>
          ) : null}

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
            disabled={isStatusActionDisabled}
            onClick={onChangeStatus}
            type="button"
          >
            Cambiar estado
          </button>
        </div>
      </div>
    </header>
  );
}
