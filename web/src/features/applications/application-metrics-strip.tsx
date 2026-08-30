import type { ApplicationMetrics } from "./application-metrics";

type ApplicationMetricsStripProps = {
  isLoading: boolean;
  metrics: ApplicationMetrics | null;
};

type MetricDefinition = {
  key: keyof ApplicationMetrics;
  label: string;
};

const METRIC_DEFINITIONS: readonly MetricDefinition[] = [
  {
    key: "total",
    label: "Total",
  },
  {
    key: "drafts",
    label: "Borradores",
  },
  {
    key: "applied",
    label: "Postuladas",
  },
  {
    key: "interviews",
    label: "Entrevistas",
  },
  {
    key: "offers",
    label: "Ofertas",
  },
  {
    key: "rejected",
    label: "Rechazadas",
  },
];

export function ApplicationMetricsStrip({
  isLoading,
  metrics,
}: ApplicationMetricsStripProps) {
  return (
    <section
      aria-busy={isLoading}
      aria-label="Resumen de postulaciones"
      className="overflow-x-auto border-y border-line"
    >
      <dl
        className={[
          "grid",
          "min-w-2xl",
          "grid-cols-6",
          "divide-x",
          "divide-line",
        ].join(" ")}
      >
        {METRIC_DEFINITIONS.map((definition) => (
          <div className="min-w-0 px-4 py-3" key={definition.key}>
            <dt className="text-xs font-medium text-foreground-subtle">
              {definition.label}
            </dt>

            <dd className="mt-1 text-xl font-semibold leading-7 text-foreground">
              {isLoading ? (
                <>
                  <span className="sr-only">Cargando</span>

                  <span
                    aria-hidden="true"
                    className={[
                      "block",
                      "h-7",
                      "w-8",
                      "animate-pulse",
                      "rounded-sm",
                      "bg-line",
                      "motion-reduce:animate-none",
                    ].join(" ")}
                  />
                </>
              ) : (
                (metrics?.[definition.key] ?? 0)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
