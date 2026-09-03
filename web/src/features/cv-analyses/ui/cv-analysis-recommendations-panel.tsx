import type {
  CvAnalysisRecommendations,
  CvRecommendation,
} from "@/domain/cv-analysis";
import {
  getReplacementRejectionReasonLabel,
  getReplacementStatusPresentation,
} from "../model/cv-recommendation-presentation";

type CvAnalysisRecommendationsPanelProps = {
  recommendations: CvAnalysisRecommendations | null;
};

type RecommendationItemProps = {
  index: number;
  recommendation: CvRecommendation;
};

function RecommendationItem({
  index,
  recommendation,
}: RecommendationItemProps) {
  const statusPresentation = getReplacementStatusPresentation(
    recommendation.status,
  );

  const rejectionReason = getReplacementRejectionReasonLabel(
    recommendation.rejectionReason,
  );

  const section = recommendation.section.trim() || "Sección no especificada";

  const matchedKeywords = recommendation.matchedKeywords
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return (
    <article className="px-4 py-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-foreground-subtle">Cambio {index + 1}</p>

          <h3 className="mt-1 text-sm font-semibold text-foreground">
            {section}
          </h3>
        </div>

        <span
          className={[
            "inline-flex",
            "h-6",
            "items-center",
            "rounded-sm",
            "border",
            "px-2",
            "text-xs",
            "font-medium",
            statusPresentation.badgeClassName,
          ].join(" ")}
        >
          {statusPresentation.label}
        </span>
      </header>

      <div className="mt-4 grid border-y border-line sm:grid-cols-2">
        <section
          aria-labelledby={`recommendation-${index}-original`}
          className="py-4 sm:pr-4"
        >
          <h4
            id={`recommendation-${index}-original`}
            className="text-xs font-medium text-foreground-subtle"
          >
            Texto original
          </h4>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground-muted">
            {recommendation.originalText}
          </p>
        </section>

        <section
          aria-labelledby={`recommendation-${index}-replacement`}
          className="border-t border-line py-4 sm:border-t-0 sm:border-l sm:pl-4"
        >
          <h4
            id={`recommendation-${index}-replacement`}
            className="text-xs font-medium text-foreground-subtle"
          >
            Reemplazo propuesto
          </h4>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
            {recommendation.replacementText}
          </p>
        </section>
      </div>

      <section
        aria-labelledby={`recommendation-${index}-rationale`}
        className="mt-4"
      >
        <h4
          id={`recommendation-${index}-rationale`}
          className="text-xs font-medium text-foreground-subtle"
        >
          Justificación
        </h4>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
          {recommendation.rationaleEs}
        </p>
      </section>

      {matchedKeywords.length > 0 ? (
        <section
          aria-labelledby={`recommendation-${index}-keywords`}
          className="mt-4"
        >
          <h4
            id={`recommendation-${index}-keywords`}
            className="text-xs font-medium text-foreground-subtle"
          >
            Palabras relacionadas
          </h4>

          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            {matchedKeywords.join(", ")}
          </p>
        </section>
      ) : null}

      {recommendation.status === "REJECTED" && rejectionReason ? (
        <section
          aria-labelledby={`recommendation-${index}-rejection`}
          className="mt-4 border-l-2 border-warning pl-3"
        >
          <h4
            id={`recommendation-${index}-rejection`}
            className="text-xs font-medium text-warning"
          >
            Motivo del rechazo
          </h4>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            {rejectionReason}
          </p>
        </section>
      ) : null}
    </article>
  );
}

export function CvAnalysisRecommendationsPanel({
  recommendations,
}: CvAnalysisRecommendationsPanelProps) {
  const items = recommendations?.items ?? [];

  return (
    <section
      aria-labelledby="cv-analysis-recommendations-title"
      className="flex h-full min-h-0 flex-col border border-line bg-surface"
    >
      <header className="shrink-0 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="cv-analysis-recommendations-title"
            className="text-sm font-semibold text-foreground"
          >
            Recomendaciones
          </h2>

          <p className="text-xs text-foreground-subtle">
            {items.length === 1 ? "1 cambio" : `${items.length} cambios`}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="px-4 py-6">
          <p className="text-sm font-medium text-foreground">
            No hay recomendaciones disponibles
          </p>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            Este análisis no produjo cambios estructurados para revisar.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto divide-y divide-line">
          {items.map((recommendation, index) => (
            <RecommendationItem
              index={index}
              key={`${recommendation.section}-${recommendation.originalText}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </section>
  );
}
