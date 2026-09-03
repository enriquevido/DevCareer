import { Download, RefreshCw } from "lucide-react";

type ResumeSourceViewerProps = {
  downloadUrl: string;
  errorMessage: string | null;
  fileName: string;
  isLoading: boolean;
  onRetry: () => void;
  source: string | undefined;
};

export function ResumeSourceViewer({
  downloadUrl,
  errorMessage,
  fileName,
  isLoading,
  onRetry,
  source,
}: ResumeSourceViewerProps) {
  return (
    <section
      aria-labelledby="resume-source-title"
      className="border border-line bg-surface"
    >
      <header
        className={[
          "flex",
          "min-h-12",
          "items-center",
          "gap-4",
          "border-b",
          "border-line",
          "px-4",
          "py-2",
        ].join(" ")}
      >
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground"
            id="resume-source-title"
          >
            Fuente LaTeX
          </h2>

          <p
            className="mt-0.5 truncate text-xs text-foreground-subtle"
            title={fileName}
          >
            {fileName}
          </p>
        </div>

        <a
          className={[
            "ml-auto",
            "inline-flex",
            "h-8",
            "shrink-0",
            "items-center",
            "gap-2",
            "rounded-sm",
            "border",
            "border-line-strong",
            "px-2.5",
            "text-xs",
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
          download={fileName}
          href={downloadUrl}
        >
          <Download aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
          Descargar .tex
        </a>
      </header>

      {isLoading ? (
        <div
          aria-live="polite"
          className="grid min-h-96 place-items-center px-6 py-12"
        >
          <p className="text-sm text-foreground-muted">Cargando fuente…</p>
        </div>
      ) : errorMessage ? (
        <div
          className="grid min-h-96 place-items-center px-6 py-12"
          role="alert"
        >
          <div className="max-w-md text-center">
            <p className="text-sm font-medium text-foreground">
              No pudimos cargar la fuente
            </p>

            <p className="mt-1.5 text-sm leading-6 text-foreground-muted">
              {errorMessage}
            </p>

            <button
              className={[
                "mt-4",
                "inline-flex",
                "h-8",
                "items-center",
                "gap-2",
                "rounded-sm",
                "border",
                "border-line-strong",
                "bg-transparent",
                "px-2.5",
                "text-xs",
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
                className="size-3.5"
                strokeWidth={1.8}
              />
              Reintentar
            </button>
          </div>
        </div>
      ) : source ? (
        <div
          className={[
            "min-h-96",
            "max-h-[calc(100dvh-18rem)]",
            "overflow-auto",
            "bg-sidebar",
          ].join(" ")}
        >
          <pre
            className={[
              "min-w-max",
              "p-4",
              "font-mono",
              "text-xs",
              "leading-5",
              "text-foreground-muted",
              "selection:bg-accent",
              "selection:text-white",
            ].join(" ")}
          >
            <code>{source}</code>
          </pre>
        </div>
      ) : (
        <div className="grid min-h-96 place-items-center px-6 py-12">
          <p className="text-sm text-foreground-muted">
            La fuente no contiene texto visible.
          </p>
        </div>
      )}
    </section>
  );
}
