import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

type ApplicationDetailErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ApplicationDetailLoadingState() {
  return (
    <div aria-busy="true" aria-live="polite" className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold text-foreground">
          Detalle de postulación
        </h1>

        <p className="mt-1.5 text-sm text-foreground-muted">
          Consultando la postulación…
        </p>
      </header>

      <div className="mt-6 grid gap-6 desktop:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <header className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Historial de estado
              </p>
            </header>

            <div className="px-4 py-8">
              <p className="text-sm text-foreground-muted">
                Consultando eventos…
              </p>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <header className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Análisis del CV
              </p>
            </header>

            <div className="px-4 py-8">
              <p className="text-sm text-foreground-muted">
                Consultando análisis…
              </p>
            </div>
          </section>
        </div>

        <section className="border border-line bg-surface">
          <header className="border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Datos de la vacante
            </p>
          </header>

          <div className="px-4 py-8">
            <p className="text-sm text-foreground-muted">
              Consultando información…
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ApplicationDetailErrorState({
  message,
  onRetry,
}: ApplicationDetailErrorStateProps) {
  return (
    <div className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold text-foreground">
          Detalle de postulación
        </h1>
      </header>

      <section
        aria-labelledby="application-detail-error-title"
        className="mt-6 border-y border-line py-8"
        role="alert"
      >
        <h2
          id="application-detail-error-title"
          className="text-sm font-semibold text-foreground"
        >
          No pudimos cargar la postulación
        </h2>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-foreground-muted">
          {message}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {onRetry ? (
            <button
              className={[
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
              <RefreshCw
                aria-hidden="true"
                className="size-4"
                strokeWidth={1.8}
              />
              Reintentar
            </button>
          ) : null}

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
            to="/applications"
          >
            Volver a postulaciones
          </Link>
        </div>
      </section>
    </div>
  );
}
