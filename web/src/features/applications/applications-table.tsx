import type { KeyboardEvent } from "react";
import type { ApplicationRecord } from "../../types/api";
import { formatApplicationDate } from "./application-format";
import { ApplicationStatusBadge } from "./application-status-badge";

type ApplicationsTableProps = {
  applications: readonly ApplicationRecord[];
  isLoading: boolean;
  onOpenApplication: (application: ApplicationRecord) => void;
  onSelectApplication: (application: ApplicationRecord) => void;
  selectedApplicationId: string | null;
};

type ApplicationTableRowProps = {
  application: ApplicationRecord;
  isSelected: boolean;
  onOpen: (application: ApplicationRecord) => void;
  onSelect: (application: ApplicationRecord) => void;
};

const LOADING_ROW_KEYS = [
  "loading-row-1",
  "loading-row-2",
  "loading-row-3",
  "loading-row-4",
  "loading-row-5",
  "loading-row-6",
] as const;

function ApplicationTableRow({
  application,
  isSelected,
  onOpen,
  onSelect,
}: ApplicationTableRowProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onOpen(application);
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      onSelect(application);
    }
  }

  return (
    <tr
      aria-selected={isSelected}
      className={[
        "cursor-pointer",
        "transition-colors",
        "duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-inset",
        "focus-visible:ring-accent",
        "motion-reduce:transition-none",
        isSelected ? "bg-surface-selected" : "hover:bg-surface-hover",
      ].join(" ")}
      onClick={() => {
        onSelect(application);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <td
        className={[
          "max-w-64",
          "border-l-2",
          "px-4",
          "py-2.5",
          "text-sm",
          "font-medium",
          "text-foreground",
          isSelected ? "border-l-accent" : "border-l-transparent",
        ].join(" ")}
      >
        <span className="block truncate" title={application.company}>
          {application.company}
        </span>
      </td>

      <td className="max-w-80 px-4 py-2.5 text-sm text-foreground">
        <span className="block truncate" title={application.jobTitle}>
          {application.jobTitle}
        </span>
      </td>

      <td className="px-4 py-2.5">
        <ApplicationStatusBadge status={application.status} />
      </td>

      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-foreground-muted">
        <time dateTime={application.updatedAt}>
          {formatApplicationDate(application.updatedAt)}
        </time>
      </td>

      <td className="whitespace-nowrap px-4 py-2.5 text-sm">
        {application.selectedCvAnalysisId ? (
          <span className="text-accent-soft">Seleccionado</span>
        ) : (
          <span className="text-foreground-subtle">—</span>
        )}
      </td>
    </tr>
  );
}

function ApplicationsTableLoadingRows() {
  return (
    <>
      {LOADING_ROW_KEYS.map((rowKey) => (
        <tr aria-hidden="true" key={rowKey}>
          {Array.from({ length: 5 }).map((_, columnIndex) => (
            <td className="px-4 py-3" key={`${rowKey}-${columnIndex}`}>
              <span
                className={[
                  "block",
                  "h-4",
                  "animate-pulse",
                  "rounded-sm",
                  "bg-line",
                  "motion-reduce:animate-none",
                  columnIndex === 0 ? "w-28" : "w-20",
                ].join(" ")}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ApplicationsTable({
  applications,
  isLoading,
  onOpenApplication,
  onSelectApplication,
  selectedApplicationId,
}: ApplicationsTableProps) {
  return (
    <div
      className={[
        "min-w-0",
        "overflow-auto",
        "border",
        "border-line",
        "bg-surface",
      ].join(" ")}
    >
      <table
        aria-busy={isLoading}
        aria-label="Listado de postulaciones"
        className="w-full min-w-4xl border-collapse text-left"
        role="grid"
      >
        <thead className="border-b border-line bg-sidebar">
          <tr>
            <th
              className="px-4 py-2.5 text-xs font-medium text-foreground-subtle"
              scope="col"
            >
              Empresa
            </th>

            <th
              className="px-4 py-2.5 text-xs font-medium text-foreground-subtle"
              scope="col"
            >
              Puesto
            </th>

            <th
              className="px-4 py-2.5 text-xs font-medium text-foreground-subtle"
              scope="col"
            >
              Estado
            </th>

            <th
              className="px-4 py-2.5 text-xs font-medium text-foreground-subtle"
              scope="col"
            >
              Actualizada
            </th>

            <th
              className="px-4 py-2.5 text-xs font-medium text-foreground-subtle"
              scope="col"
            >
              CV seleccionado
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-line">
          {isLoading ? (
            <ApplicationsTableLoadingRows />
          ) : (
            applications.map((application) => (
              <ApplicationTableRow
                application={application}
                isSelected={application.id === selectedApplicationId}
                key={application.id}
                onOpen={onOpenApplication}
                onSelect={onSelectApplication}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
