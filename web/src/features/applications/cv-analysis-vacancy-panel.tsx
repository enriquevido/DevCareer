import type { ApplicationRecord } from "../../types/api";

type CvAnalysisVacancyPanelProps = {
  application: ApplicationRecord;
};

export function CvAnalysisVacancyPanel({
  application,
}: CvAnalysisVacancyPanelProps) {
  const description = application.description?.trim() || null;

  return (
    <section
      aria-labelledby="cv-analysis-vacancy-title"
      className="flex h-full min-h-0 flex-col border border-line bg-surface"
    >
      <header className="shrink-0 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="cv-analysis-vacancy-title"
            className="text-sm font-semibold text-foreground"
          >
            Vacante
          </h2>

          <p className="text-xs text-foreground-subtle">Descripción original</p>
        </div>

        <p className="mt-1 truncate text-xs text-foreground-muted">
          {application.company}
          {" · "}
          {application.jobTitle}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
        {description ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
            {description}
          </p>
        ) : (
          <div className="py-2">
            <p className="text-sm font-medium text-foreground">
              La descripción ya no está disponible
            </p>

            <p className="mt-1 text-sm leading-6 text-foreground-muted">
              La postulación no contiene actualmente el texto original de la
              vacante.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
