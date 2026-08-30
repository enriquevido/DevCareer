import type { ReactNode } from "react";
import type { ApplicationRecord } from "../../types/api";
import {
  formatApplicationDateTime,
  getApplicationWorkplaceLabel,
} from "./application-format";

type ApplicationDetailsPanelProps = {
  application: ApplicationRecord;
};

type ApplicationDetailFieldProps = {
  children: ReactNode;
  label: string;
};

function ApplicationDetailField({
  children,
  label,
}: ApplicationDetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-foreground-subtle">{label}</dt>

      <dd className="mt-1 break-words text-sm leading-5 text-foreground">
        {children}
      </dd>
    </div>
  );
}

export function ApplicationDetailsPanel({
  application,
}: ApplicationDetailsPanelProps) {
  const workplace = getApplicationWorkplaceLabel(application);

  const salaryRange = application.salaryRange?.trim() || null;

  const source = application.source?.trim() || null;

  const description = application.description?.trim() || null;

  const notes = application.notes?.trim() || null;

  return (
    <section
      aria-labelledby="application-details-title"
      className="border border-line bg-surface"
    >
      <header className="border-b border-line px-4 py-3">
        <h2
          className="text-sm font-semibold text-foreground"
          id="application-details-title"
        >
          Datos de la vacante
        </h2>
      </header>

      <dl className="grid gap-5 px-4 py-4 sm:grid-cols-2">
        {workplace ? (
          <ApplicationDetailField label="Ubicación">
            {workplace}
          </ApplicationDetailField>
        ) : null}

        {salaryRange ? (
          <ApplicationDetailField label="Rango salarial">
            {salaryRange}
          </ApplicationDetailField>
        ) : null}

        {source ? (
          <ApplicationDetailField label="Fuente">
            {source}
          </ApplicationDetailField>
        ) : null}

        <ApplicationDetailField label="Creada">
          <time dateTime={application.createdAt}>
            {formatApplicationDateTime(application.createdAt)}
          </time>
        </ApplicationDetailField>

        <ApplicationDetailField label="Última actualización">
          <time dateTime={application.updatedAt}>
            {formatApplicationDateTime(application.updatedAt)}
          </time>
        </ApplicationDetailField>
      </dl>

      {description ? (
        <section
          aria-labelledby="application-description-title"
          className="border-t border-line px-4 py-4"
        >
          <h3
            className="text-xs font-medium text-foreground-subtle"
            id="application-description-title"
          >
            Descripción
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
            {description}
          </p>
        </section>
      ) : null}

      {notes ? (
        <section
          aria-labelledby="application-notes-title"
          className="border-t border-line px-4 py-4"
        >
          <h3
            className="text-xs font-medium text-foreground-subtle"
            id="application-notes-title"
          >
            Notas
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
            {notes}
          </p>
        </section>
      ) : null}
    </section>
  );
}
