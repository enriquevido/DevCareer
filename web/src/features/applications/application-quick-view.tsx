import { ExternalLink, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ApplicationRecord } from "@/domain/application";
import { formatDateTime } from "@/shared/lib/date-format";
import {
  getApplicationWorkplaceLabel,
  getSafeApplicationUrl,
} from "./application-format";
import { ApplicationStatusBadge } from "./application-status-badge";

type ApplicationQuickViewProps = {
  application: ApplicationRecord;
  onClose: () => void;
};

type QuickViewFieldProps = {
  children: ReactNode;
  label: string;
};

function QuickViewField({ children, label }: QuickViewFieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-foreground-subtle">{label}</dt>

      <dd className="mt-1 text-sm leading-5 text-foreground">{children}</dd>
    </div>
  );
}

export function ApplicationQuickView({
  application,
  onClose,
}: ApplicationQuickViewProps) {
  const workplaceLabel = getApplicationWorkplaceLabel(application);

  const safeJobUrl = getSafeApplicationUrl(application.jobUrl);

  const salaryRange = application.salaryRange?.trim() || null;

  const source = application.source?.trim() || null;

  return (
    <aside
      aria-labelledby="application-quick-view-title"
      className={[
        "self-start",
        "border",
        "border-line",
        "bg-surface",
        "xl:sticky",
        "xl:top-6",
      ].join(" ")}
    >
      <header
        className={[
          "flex",
          "items-start",
          "gap-4",
          "border-b",
          "border-line",
          "px-4",
          "py-4",
        ].join(" ")}
      >
        <div className="min-w-0">
          <h2
            className="truncate text-base font-semibold text-foreground"
            id="application-quick-view-title"
            title={application.company}
          >
            {application.company}
          </h2>

          <p
            className="mt-1 truncate text-sm text-foreground-muted"
            title={application.jobTitle}
          >
            {application.jobTitle}
          </p>
        </div>

        <button
          aria-label={`Cerrar vista rápida de ${application.company}`}
          className={[
            "ml-auto",
            "grid",
            "size-8",
            "shrink-0",
            "place-items-center",
            "rounded-sm",
            "border-0",
            "bg-transparent",
            "p-0",
            "text-foreground-muted",
            "transition-colors",
            "duration-150",
            "hover:bg-surface-hover",
            "hover:text-foreground",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent",
            "motion-reduce:transition-none",
          ].join(" ")}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </button>
      </header>

      <dl className="space-y-5 px-4 py-5">
        <QuickViewField label="Estado">
          <ApplicationStatusBadge status={application.status} />
        </QuickViewField>

        {workplaceLabel ? (
          <QuickViewField label="Ubicación">{workplaceLabel}</QuickViewField>
        ) : null}

        {salaryRange ? (
          <QuickViewField label="Rango salarial">{salaryRange}</QuickViewField>
        ) : null}

        {source ? (
          <QuickViewField label="Fuente">{source}</QuickViewField>
        ) : null}

        <QuickViewField label="CV seleccionado">
          {application.selectedCvAnalysisId
            ? "Seleccionado"
            : "Sin seleccionar"}
        </QuickViewField>

        <QuickViewField label="Última actualización">
          <time dateTime={application.updatedAt}>
            {formatDateTime(application.updatedAt)}
          </time>
        </QuickViewField>

        {safeJobUrl ? (
          <QuickViewField label="Vacante original">
            <a
              className={[
                "inline-flex",
                "items-center",
                "gap-1.5",
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
              Abrir enlace
              <ExternalLink
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={1.8}
              />
            </a>
          </QuickViewField>
        ) : null}
      </dl>

      <footer
        className={[
          "flex",
          "items-center",
          "justify-end",
          "gap-2",
          "border-t",
          "border-line",
          "px-4",
          "py-3",
        ].join(" ")}
      >
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

        <Link
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
          to={`/applications/${application.id}`}
        >
          Ver detalle
        </Link>
      </footer>
    </aside>
  );
}
