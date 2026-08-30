import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import type {
  ApplicationFilters,
  ApplicationRecord,
  ApplicationStatus,
} from "../../types/api";
import { applicationQueryKeys, fetchApplications } from "./application-api";
import { getApplicationErrorMessage } from "./application-error";
import { ApplicationFiltersBar } from "./application-filters-bar";
import { calculateApplicationMetrics } from "./application-metrics";
import { ApplicationMetricsStrip } from "./application-metrics-strip";
import { ApplicationQuickView } from "./application-quick-view";
import { ApplicationsTable } from "./applications-table";

type ApplicationsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

type ApplicationsEmptyStateProps = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

const EMPTY_APPLICATIONS: readonly ApplicationRecord[] = [];

function ApplicationsErrorState({
  message,
  onRetry,
}: ApplicationsErrorStateProps) {
  return (
    <section
      aria-labelledby="applications-error-title"
      className="border-y border-line py-8"
      role="alert"
    >
      <h2
        className="text-sm font-semibold text-foreground"
        id="applications-error-title"
      >
        No pudimos cargar las postulaciones
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
        {message}
      </p>

      <button
        className={[
          "mt-4",
          "inline-flex",
          "h-9",
          "items-center",
          "gap-2",
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
          "motion-reduce:transition-none",
        ].join(" ")}
        onClick={onRetry}
        type="button"
      >
        <RefreshCw aria-hidden="true" className="size-4" strokeWidth={1.8} />
        Reintentar
      </button>
    </section>
  );
}

function ApplicationsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: ApplicationsEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <section className="border-y border-line py-8">
        <h2 className="text-sm font-semibold text-foreground">
          No encontramos coincidencias
        </h2>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
          Prueba con otro término o elimina el filtro de estado.
        </p>

        <button
          className={[
            "mt-4",
            "inline-flex",
            "h-9",
            "items-center",
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
            "motion-reduce:transition-none",
          ].join(" ")}
          onClick={onClearFilters}
          type="button"
        >
          Limpiar filtros
        </button>
      </section>
    );
  }

  return (
    <section className="border-y border-line py-8">
      <h2 className="text-sm font-semibold text-foreground">
        Todavía no hay postulaciones
      </h2>

      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
        Registra tu primera vacante para conservar su descripción, estado y
        versiones de CV relacionadas.
      </p>

      <Link
        className={[
          "mt-4",
          "inline-flex",
          "h-9",
          "items-center",
          "rounded-sm",
          "border",
          "border-accent",
          "bg-accent",
          "px-3",
          "text-sm",
          "font-medium",
          "text-white",
          "no-underline",
          "transition-colors",
          "duration-150",
          "hover:border-accent-hover",
          "hover:bg-accent-hover",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent-hover",
          "motion-reduce:transition-none",
        ].join(" ")}
        to="/applications/new"
      >
        Nueva postulación
      </Link>
    </section>
  );
}

export function ApplicationsPage() {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const [statusValue, setStatusValue] = useState<ApplicationStatus | "">("");

  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const debouncedSearchValue = useDebouncedValue(searchValue, 300);

  const filters = useMemo<ApplicationFilters>(() => {
    const normalizedSearch = debouncedSearchValue.trim();

    return {
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
      ...(statusValue ? { status: statusValue } : {}),
    };
  }, [debouncedSearchValue, statusValue]);

  const applicationsQuery = useQuery({
    queryKey: applicationQueryKeys.list(filters),
    queryFn: () => fetchApplications(filters),
    placeholderData: keepPreviousData,
  });

  const applications = applicationsQuery.data ?? EMPTY_APPLICATIONS;

  const metrics = useMemo(
    () => calculateApplicationMetrics(applications),
    [applications],
  );

  const selectedApplication =
    applications.find(
      (application) => application.id === selectedApplicationId,
    ) ?? null;

  const hasActiveFilters =
    searchValue.trim().length > 0 || statusValue.length > 0;

  const isWaitingForSearch = searchValue.trim() !== debouncedSearchValue.trim();

  const isUpdating =
    isWaitingForSearch ||
    (applicationsQuery.isFetching && !applicationsQuery.isPending);

  function handleSearchChange(value: string): void {
    setSearchValue(value);
    setSelectedApplicationId(null);
  }

  function handleStatusChange(value: ApplicationStatus | ""): void {
    setStatusValue(value);
    setSelectedApplicationId(null);
  }

  function clearFilters(): void {
    setSearchValue("");
    setStatusValue("");
    setSelectedApplicationId(null);
  }

  function openApplication(application: ApplicationRecord): void {
    void navigate(`/applications/${application.id}`);
  }

  const errorMessage = applicationsQuery.isError
    ? getApplicationErrorMessage(
        applicationsQuery.error,
        "No pudimos obtener el listado de postulaciones.",
      )
    : null;

  return (
    <div className="w-full min-w-0">
      <header
        className={[
          "flex",
          "flex-col",
          "gap-4",
          "border-b",
          "border-line",
          "pb-5",
          "sm:flex-row",
          "sm:items-start",
          "sm:justify-between",
        ].join(" ")}
      >
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Postulaciones
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
            Vacantes, estados y seguimiento del proceso.
          </p>
        </div>

        <Link
          className={[
            "inline-flex",
            "h-9",
            "shrink-0",
            "items-center",
            "justify-center",
            "gap-2",
            "self-start",
            "rounded-sm",
            "border",
            "border-accent",
            "bg-accent",
            "px-3",
            "text-sm",
            "font-medium",
            "text-white",
            "no-underline",
            "transition-colors",
            "duration-150",
            "hover:border-accent-hover",
            "hover:bg-accent-hover",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent-hover",
            "focus-visible:ring-offset-2",
            "focus-visible:ring-offset-canvas",
            "motion-reduce:transition-none",
          ].join(" ")}
          to="/applications/new"
        >
          <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
          Nueva postulación
        </Link>
      </header>

      {applicationsQuery.isError ? null : (
        <div className="mt-5">
          <ApplicationMetricsStrip
            isLoading={applicationsQuery.isPending}
            metrics={metrics}
          />
        </div>
      )}

      <div className="mt-6">
        <ApplicationFiltersBar
          isDisabled={applicationsQuery.isPending}
          onClear={clearFilters}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          searchValue={searchValue}
          statusValue={statusValue}
        />
      </div>

      <div aria-live="polite" className="mt-2 min-h-5">
        {isUpdating ? (
          <p className="text-xs text-foreground-subtle">
            Actualizando resultados…
          </p>
        ) : !applicationsQuery.isPending && !applicationsQuery.isError ? (
          <p className="text-xs text-foreground-subtle">
            {applications.length}{" "}
            {applications.length === 1 ? "postulación" : "postulaciones"}
          </p>
        ) : null}
      </div>

      <div className="mt-2">
        {applicationsQuery.isError && errorMessage ? (
          <ApplicationsErrorState
            message={errorMessage}
            onRetry={() => {
              void applicationsQuery.refetch();
            }}
          />
        ) : !applicationsQuery.isPending && applications.length === 0 ? (
          <ApplicationsEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <div
            className={[
              "grid",
              "min-w-0",
              "gap-3",
              selectedApplication
                ? "xl:grid-cols-[minmax(0,1fr)_22rem]"
                : "grid-cols-1",
            ].join(" ")}
          >
            <ApplicationsTable
              applications={applications}
              isLoading={applicationsQuery.isPending}
              onOpenApplication={openApplication}
              onSelectApplication={(application) => {
                setSelectedApplicationId(application.id);
              }}
              selectedApplicationId={selectedApplication?.id ?? null}
            />

            {selectedApplication ? (
              <ApplicationQuickView
                application={selectedApplication}
                onClose={() => {
                  setSelectedApplicationId(null);
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
