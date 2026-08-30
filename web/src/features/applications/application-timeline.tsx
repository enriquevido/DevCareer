import type { TimelineEvent } from "../../types/application";
import { ApplicationStatusBadge } from "./application-status-badge";
import { formatApplicationDateTime } from "./application-format";

type ApplicationTimelineProps = {
  events: readonly TimelineEvent[];
};

function getEventTimestamp(value: string): number {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  const sortedEvents = [...events].sort(
    (left, right) =>
      getEventTimestamp(right.createdAt) - getEventTimestamp(left.createdAt),
  );

  return (
    <section
      aria-labelledby="application-timeline-title"
      className="border border-line bg-surface"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2
          id="application-timeline-title"
          className="text-sm font-semibold text-foreground"
        >
          Historial de estado
        </h2>
      </header>

      {sortedEvents.length === 0 ? (
        <div className="px-4 py-6">
          <p className="text-sm text-foreground-muted">
            No hay cambios de estado registrados.
          </p>
        </div>
      ) : (
        <ol className="px-4 py-4">
          {sortedEvents.map((event, index) => {
            const isCurrent = index === 0;
            const note = event.note?.trim();

            return (
              <li key={event.id} className="relative pb-5 last:pb-0">
                {index < sortedEvents.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 bottom-[-0.5rem] left-[0.28125rem] w-px bg-line"
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-1.5 left-0 z-10 size-2.5 rounded-full",
                    "border-2 border-surface",
                    isCurrent ? "bg-accent" : "bg-line-strong",
                  ].join(" ")}
                />

                <div className="min-w-0 pl-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <ApplicationStatusBadge status={event.status} />

                    {isCurrent ? (
                      <span className="text-xs font-medium text-accent-soft">
                        Actual
                      </span>
                    ) : null}
                  </div>

                  <time
                    dateTime={event.createdAt}
                    className="mt-1 block text-xs text-foreground-subtle"
                  >
                    {formatApplicationDateTime(event.createdAt)}
                  </time>

                  {note ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
                      {note}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
