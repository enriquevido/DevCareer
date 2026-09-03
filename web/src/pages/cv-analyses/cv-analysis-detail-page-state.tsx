import { Link } from "react-router-dom";

type CvAnalysisDetailErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function CvAnalysisDetailLoadingState() {
  return (
    <div aria-busy="true" aria-live="polite" className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
          Análisis del CV
        </h1>

        <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
          Consultando el resultado y sus recomendaciones…
        </p>
      </header>

      <section className="mt-6 border-y border-line py-8">
        <p className="text-sm font-medium text-foreground">
          Preparando el espacio de revisión
        </p>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-muted">
          Estamos obteniendo el análisis, la vacante original y el estado del CV
          seleccionado.
        </p>
      </section>
    </div>
  );
}

export function CvAnalysisDetailErrorState({
  message,
  onRetry,
}: CvAnalysisDetailErrorStateProps) {
  return (
    <div className="w-full min-w-0">
      <header className="border-b border-line pb-5">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
          Análisis del CV
        </h1>
      </header>

      <section
        aria-labelledby="cv-analysis-detail-error-title"
        className="mt-6 border-y border-line py-8"
        role="alert"
      >
        <h2
          id="cv-analysis-detail-error-title"
          className="text-sm font-semibold text-foreground"
        >
          No pudimos cargar el análisis
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
                "justify-center",
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
