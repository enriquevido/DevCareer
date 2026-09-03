import type { CvAnalysisStatus } from "@/domain/cv-analysis";
import { getCvAnalysisStatusPresentation } from "./cv-analysis-status";

type CvAnalysisStatusBadgeProps = {
  status: CvAnalysisStatus;
};

export function CvAnalysisStatusBadge({ status }: CvAnalysisStatusBadgeProps) {
  const presentation = getCvAnalysisStatusPresentation(status);

  return (
    <span
      className={[
        "inline-flex",
        "h-6",
        "items-center",
        "gap-1.5",
        "whitespace-nowrap",
        "rounded-full",
        "border",
        "px-2",
        "text-xs",
        "font-medium",
        presentation.badgeClassName,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "size-1.5",
          "shrink-0",
          "rounded-full",
          presentation.dotClassName,
        ].join(" ")}
      />

      {presentation.label}
    </span>
  );
}
