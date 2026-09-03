import { useState } from "react";
import type { ApplicationRecord } from "@/domain/application";
import type { CvAnalysis } from "@/domain/cv-analysis";
import { CvAnalysisRecommendationsPanel } from "./cv-analysis-recommendations-panel";
import { CvAnalysisResultPanel } from "./cv-analysis-result-panel";
import { CvAnalysisVacancyPanel } from "./cv-analysis-vacancy-panel";

type CvAnalysisWorkspaceProps = {
  analysis: CvAnalysis;
  application: ApplicationRecord;
};

type WorkspaceView = "vacancy" | "result" | "recommendations";

const WORKSPACE_VIEWS = [
  {
    label: "Vacante",
    value: "vacancy",
  },
  {
    label: "Resultado",
    value: "result",
  },
  {
    label: "Cambios",
    value: "recommendations",
  },
] satisfies readonly {
  label: string;
  value: WorkspaceView;
}[];

function getPanelClassName(
  panel: WorkspaceView,
  activeView: WorkspaceView,
): string {
  return [
    "min-h-0",
    "min-w-0",
    panel === activeView ? "flex" : "hidden",
    "xl:flex",
  ].join(" ");
}

export function CvAnalysisWorkspace({
  analysis,
  application,
}: CvAnalysisWorkspaceProps) {
  const [activeView, setActiveView] = useState<WorkspaceView>("result");

  return (
    <section aria-label="Revisión del análisis" className="mt-6 min-w-0">
      <div
        aria-label="Sección visible"
        className="flex border-b border-line xl:hidden"
        role="group"
      >
        {WORKSPACE_VIEWS.map((view) => {
          const isActive = activeView === view.value;

          return (
            <button
              aria-controls={`cv-analysis-${view.value}-panel`}
              aria-pressed={isActive}
              className={[
                "min-w-0",
                "flex-1",
                "border-b-2",
                "px-3",
                "py-2.5",
                "text-sm",
                "font-medium",
                "transition-colors",
                "duration-150",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-inset",
                "focus-visible:ring-accent",
                "motion-reduce:transition-none",
                isActive
                  ? "border-accent text-foreground"
                  : [
                      "border-transparent",
                      "text-foreground-muted",
                      "hover:border-line-strong",
                      "hover:text-foreground",
                    ].join(" "),
              ].join(" ")}
              key={view.value}
              onClick={() => {
                setActiveView(view.value);
              }}
              type="button"
            >
              {view.label}
            </button>
          );
        })}
      </div>

      <div
        className={[
          "mt-3",
          "grid",
          "h-[calc(100dvh-13rem)]",
          "min-h-96",
          "max-h-[44rem]",
          "gap-3",
          "xl:h-[calc(100dvh-15rem)]",
          "xl:min-h-[32rem]",
          "xl:max-h-[52rem]",
          "xl:grid-cols-[minmax(17rem,0.8fr)_minmax(19rem,1fr)_minmax(22rem,1.2fr)]",
        ].join(" ")}
      >
        <div
          className={getPanelClassName("vacancy", activeView)}
          id="cv-analysis-vacancy-panel"
        >
          <CvAnalysisVacancyPanel application={application} />
        </div>

        <div
          className={getPanelClassName("result", activeView)}
          id="cv-analysis-result-panel"
        >
          <div className="min-h-0 w-full overflow-auto">
            <CvAnalysisResultPanel analysis={analysis} />
          </div>
        </div>

        <div
          className={getPanelClassName("recommendations", activeView)}
          id="cv-analysis-recommendations-panel"
        >
          <CvAnalysisRecommendationsPanel
            recommendations={analysis.recommendations}
          />
        </div>
      </div>
    </section>
  );
}
