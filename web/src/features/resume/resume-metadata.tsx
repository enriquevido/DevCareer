import type { ResumeVersion } from "../../types/api";

type ResumeMetadataProps = {
  resume: ResumeVersion;
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return DATE_TIME_FORMATTER.format(date);
}

function shortenHash(hash: string): string {
  if (hash.length <= 12) {
    return hash;
  }

  return `${hash.slice(0, 12)}…`;
}

export function ResumeMetadata({ resume }: ResumeMetadataProps) {
  const formattedCreatedAt = formatCreatedAt(resume.createdAt);

  return (
    <section
      aria-label="Información de la versión actual"
      className={["grid", "border-y", "border-line", "sm:grid-cols-3"].join(
        " ",
      )}
    >
      <div className="min-w-0 py-4 sm:pr-4">
        <p className="text-xs text-foreground-subtle">Archivo</p>

        <p
          className="mt-1 truncate text-sm font-medium text-foreground"
          title={resume.originalName}
        >
          {resume.originalName}
        </p>
      </div>

      <div
        className={[
          "min-w-0",
          "border-t",
          "border-line",
          "py-4",
          "sm:border-t-0",
          "sm:border-l",
          "sm:px-4",
        ].join(" ")}
      >
        <p className="text-xs text-foreground-subtle">Creado</p>

        <time
          className="mt-1 block text-sm text-foreground"
          dateTime={resume.createdAt}
        >
          {formattedCreatedAt}
        </time>
      </div>

      <div
        className={[
          "min-w-0",
          "border-t",
          "border-line",
          "py-4",
          "sm:border-t-0",
          "sm:border-l",
          "sm:pl-4",
        ].join(" ")}
      >
        <p className="text-xs text-foreground-subtle">SHA-256</p>

        <code
          aria-label={`SHA-256 ${resume.sha256}`}
          className="mt-1 block truncate font-mono text-xs text-foreground"
          title={resume.sha256}
        >
          {shortenHash(resume.sha256)}
        </code>
      </div>
    </section>
  );
}
