import type { ApplicationStatus } from "../../types/api";
import { getApplicationStatusPresentation } from "./application-status";

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
};

export function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  const presentation = getApplicationStatusPresentation(status);

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
