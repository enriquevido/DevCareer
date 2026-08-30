import { Link } from "react-router-dom";
import type { CvAnalysisSummary } from "../../types/api";
import { formatApplicationDateTime } from "./application-format";
import { CvAnalysisStatusBadge } from "./cv-analysis-status-badge";

type ApplicationAnalysisHistoryProps = {
  analyses: readonly CvAnalysisSummary[];
  selectedCvAnalysisId: string | null;
};

function getAnalysisTimestamp(value: string): number {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function ApplicationAnalysisHistory({
  analyses,
  selectedCvAnalysisId,
}: ApplicationAnalysisHistoryProps) {
  const sortedAnalyses = [...analyses].sort(
    (left, right) =>
      getAnalysisTimestamp(right.createdAt) -
      getAnalysisTimestamp(left.createdAt),
  );

  return (
    <section
      aria-labelledby="application-analysis-history-title"
      className="border border-line bg-surface"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2
          id="application-analysis-history-title"
          className="text-sm font-semibold text-foreground"
        >
          Análisis del CV
        </h2>

        <p className="text-xs text-foreground-subtle">
          {sortedAnalyses.length === 1
            ? "1 análisis"
            : `${sortedAnalyses.length} análisis`}
        </p>
      </header>

      {sortedAnalyses.length === 0 ? (
        <div className="px-4 py-6">
          <p className="text-sm font-medium text-foreground">
            Todavía no hay análisis
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-muted">
            Cuando generes un análisis para esta vacante, podrás consultar aquí
            su estado y resultado.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {sortedAnalyses.map((analysis) => {
            const isSelected = analysis.id === selectedCvAnalysisId;
            const summary = analysis.summaryEs?.trim();

            return (
              <li
                key={analysis.id}
                className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CvAnalysisStatusBadge status={analysis.status} />

                    {isSelected ? (
                      <span className="text-xs font-medium text-accent-soft">
                        CV seleccionado
                      </span>
                    ) : null}
                  </div>

                  {summary ? (
                    <p className="mt-3 text-sm leading-6 text-foreground-muted">
                      {summary}
                    </p>
                  ) : null}

                  <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                      <dt className="text-foreground-subtle">Modelo</dt>

                      <dd className="break-all font-mono text-foreground-muted">
                        {analysis.model}
                      </dd>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <dt className="text-foreground-subtle">Creado</dt>

                      <dd className="text-foreground-muted">
                        <time dateTime={analysis.createdAt}>
                          {formatApplicationDateTime(analysis.createdAt)}
                        </time>
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  className={[
                    "inline-flex",
                    "h-9",
                    "w-fit",
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
                  to={`/cv-analyses/${analysis.id}`}
                >
                  Ver análisis
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
