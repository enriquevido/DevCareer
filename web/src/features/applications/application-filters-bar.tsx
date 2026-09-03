import { ChevronDown, Search, X } from "lucide-react";
import type { ChangeEvent } from "react";
import type { ApplicationStatus } from "@/domain/application";
import { APPLICATION_STATUS_OPTIONS } from "./application-status";

type ApplicationFiltersBarProps = {
  isDisabled?: boolean;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ApplicationStatus | "") => void;
  searchValue: string;
  statusValue: ApplicationStatus | "";
};

export function ApplicationFiltersBar({
  isDisabled = false,
  onClear,
  onSearchChange,
  onStatusChange,
  searchValue,
  statusValue,
}: ApplicationFiltersBarProps) {
  const hasActiveFilters =
    searchValue.trim().length > 0 || statusValue.length > 0;

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    const selectedStatus =
      APPLICATION_STATUS_OPTIONS.find(
        (option) => option.value === event.currentTarget.value,
      )?.value ?? "";

    onStatusChange(selectedStatus);
  }

  return (
    <div
      aria-label="Filtros de postulaciones"
      className={[
        "flex",
        "flex-col",
        "gap-3",
        "border",
        "border-line",
        "bg-surface",
        "p-3",
        "sm:flex-row",
        "sm:items-end",
      ].join(" ")}
      role="search"
    >
      <label className="min-w-0 flex-1">
        <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
          Buscar
        </span>

        <span className="relative block">
          <Search
            aria-hidden="true"
            className={[
              "pointer-events-none",
              "absolute",
              "top-1/2",
              "left-3",
              "size-4",
              "-translate-y-1/2",
              "text-foreground-subtle",
            ].join(" ")}
            strokeWidth={1.8}
          />

          <input
            autoComplete="off"
            className={[
              "h-9",
              "w-full",
              "rounded-sm",
              "border",
              "border-line-strong",
              "bg-sidebar",
              "pr-3",
              "pl-9",
              "text-sm",
              "text-foreground",
              "outline-none",
              "placeholder:text-foreground-subtle",
              "focus:border-accent",
              "focus:ring-2",
              "focus:ring-accent/30",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ].join(" ")}
            disabled={isDisabled}
            onChange={(event) => {
              onSearchChange(event.currentTarget.value);
            }}
            placeholder="Empresa o puesto"
            type="search"
            value={searchValue}
          />
        </span>
      </label>

      <label className="sm:w-56">
        <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
          Estado
        </span>

        <span className="relative block">
          <select
            className={[
              "h-9",
              "w-full",
              "appearance-none",
              "rounded-sm",
              "border",
              "border-line-strong",
              "bg-sidebar",
              "py-0",
              "pr-10",
              "pl-3",
              "text-sm",
              "text-foreground",
              "outline-none",
              "focus:border-accent",
              "focus:ring-2",
              "focus:ring-accent/30",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
            ].join(" ")}
            disabled={isDisabled}
            onChange={handleStatusChange}
            value={statusValue}
          >
            <option value="">Todos los estados</option>

            {APPLICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            aria-hidden="true"
            className={[
              "pointer-events-none",
              "absolute",
              "top-1/2",
              "right-3",
              "size-4",
              "-translate-y-1/2",
              "text-foreground-muted",
            ].join(" ")}
            strokeWidth={1.8}
          />
        </span>
      </label>

      {hasActiveFilters ? (
        <button
          className={[
            "inline-flex",
            "h-9",
            "shrink-0",
            "items-center",
            "justify-center",
            "gap-2",
            "rounded-sm",
            "border",
            "border-line-strong",
            "bg-transparent",
            "px-3",
            "text-sm",
            "font-medium",
            "text-foreground-muted",
            "transition-colors",
            "duration-150",
            "hover:bg-surface-hover",
            "hover:text-foreground",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isDisabled}
          onClick={onClear}
          type="button"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
