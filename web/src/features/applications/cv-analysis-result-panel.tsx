import type { CvAnalysis } from "../../types/api";

type CvAnalysisResultPanelProps = {
  analysis: CvAnalysis;
};

type AnalysisDiagnosticProps = {
  message: string;
  title: string;
};

function AnalysisDiagnostic({ message, title }: AnalysisDiagnosticProps) {
  return (
    <section
      aria-labelledby="analysis-diagnostic-title"
      className="border-t border-line px-4 py-4"
    >
      <h3
        id="analysis-diagnostic-title"
        className="text-xs font-medium text-danger"
      >
        {title}
      </h3>

      <pre
        className={[
          "mt-2",
          "max-h-56",
          "overflow-auto",
          "whitespace-pre-wrap",
          "break-words",
          "border-l-2",
          "border-danger",
          "pl-3",
          "font-mono",
          "text-xs",
          "leading-5",
          "text-foreground-muted",
        ].join(" ")}
      >
        {message}
      </pre>
    </section>
  );
}

export function CvAnalysisResultPanel({
  analysis,
}: CvAnalysisResultPanelProps) {
  const summary = analysis.summaryEs?.trim() || null;

  const errorMessage = analysis.errorMessage?.trim() || null;

  const recommendations = analysis.recommendations;

  if (analysis.status === "PROCESSING") {
    return (
      <section
        aria-labelledby="cv-analysis-result-title"
        aria-live="polite"
        className="border border-line bg-surface"
      >
        <header className="border-b border-line px-4 py-3">
          <h2
            id="cv-analysis-result-title"
            className="text-sm font-semibold text-foreground"
          >
            Resultado
          </h2>
        </header>

        <div className="px-4 py-6">
          <p className="text-sm font-medium text-foreground">
            El análisis sigue en curso
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-muted">
            Estamos revisando la vacante, aplicando cambios seguros y
            comprobando la compilación del documento.
          </p>
        </div>
      </section>
    );
  }

  if (analysis.status === "AI_FAILED") {
    return (
      <section
        aria-labelledby="cv-analysis-result-title"
        className="border border-line bg-surface"
      >
        <header className="border-b border-line px-4 py-3">
          <h2
            id="cv-analysis-result-title"
            className="text-sm font-semibold text-foreground"
          >
            Resultado
          </h2>
        </header>

        <div className="px-4 py-6">
          <p className="text-sm font-medium text-foreground">
            No se produjo un resultado confiable
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground-muted">
            El documento fuente no fue modificado. Regresa a la postulación para
            iniciar un análisis nuevo.
          </p>
        </div>

        {errorMessage ? (
          <AnalysisDiagnostic
            message={errorMessage}
            title="Diagnóstico del análisis"
          />
        ) : null}
      </section>
    );
  }

  const matchedKeywords = recommendations?.matchedKeywords ?? [];

  const missingKeywords = recommendations?.missingKeywords ?? [];

  const warnings = recommendations?.warningsEs ?? [];

  const hasStructuredResult = Boolean(summary || recommendations);

  return (
    <section
      aria-labelledby="cv-analysis-result-title"
      className="border border-line bg-surface"
    >
      <header className="border-b border-line px-4 py-3">
        <h2
          id="cv-analysis-result-title"
          className="text-sm font-semibold text-foreground"
        >
          Resultado
        </h2>
      </header>

      {hasStructuredResult ? (
        <>
          {summary ? (
            <section
              aria-labelledby="cv-analysis-summary-title"
              className="px-4 py-4"
            >
              <h3
                id="cv-analysis-summary-title"
                className="text-xs font-medium text-foreground-subtle"
              >
                Resumen
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {summary}
              </p>
            </section>
          ) : null}

          {recommendations ? (
            <dl className="grid border-t border-line sm:grid-cols-2">
              <div className="px-4 py-4 sm:pr-5">
                <dt className="text-xs font-medium text-success">
                  Palabras encontradas
                </dt>

                <dd className="mt-2 text-sm leading-6 text-foreground-muted">
                  {matchedKeywords.length > 0
                    ? matchedKeywords.join(", ")
                    : "No se registraron coincidencias."}
                </dd>
              </div>

              <div className="border-t border-line px-4 py-4 sm:border-t-0 sm:border-l sm:pl-5">
                <dt className="text-xs font-medium text-warning">
                  Brechas detectadas
                </dt>

                <dd className="mt-2 text-sm leading-6 text-foreground-muted">
                  {missingKeywords.length > 0
                    ? missingKeywords.join(", ")
                    : "No se registraron brechas."}
                </dd>
              </div>
            </dl>
          ) : null}

          {warnings.length > 0 ? (
            <section
              aria-labelledby="cv-analysis-warnings-title"
              className="border-t border-line px-4 py-4"
            >
              <h3
                id="cv-analysis-warnings-title"
                className="text-xs font-medium text-warning"
              >
                Advertencias
              </h3>

              <div className="mt-2 divide-y divide-line">
                {warnings.map((warning, index) => (
                  <p
                    className="py-2 first:pt-0 last:pb-0 text-sm leading-6 text-foreground-muted"
                    key={`${warning}-${index}`}
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="px-4 py-6">
          <p className="text-sm text-foreground-muted">
            No hay un resultado estructurado disponible.
          </p>
        </div>
      )}

      {analysis.status === "COMPILE_FAILED" && errorMessage ? (
        <AnalysisDiagnostic
          message={errorMessage}
          title="Diagnóstico del documento"
        />
      ) : null}
    </section>
  );
}
