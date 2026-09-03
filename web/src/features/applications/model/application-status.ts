import { APPLICATION_STATUSES, type ApplicationStatus } from "@/domain/application";

export type ApplicationStatusPresentation = {
  badgeClassName: string;
  dotClassName: string;
  label: string;
};

const APPLICATION_STATUS_PRESENTATION = {
  DRAFT: {
    label: "Borrador",
    badgeClassName: "border-line-strong bg-surface-hover text-foreground-muted",
    dotClassName: "bg-foreground-subtle",
  },
  APPLIED: {
    label: "Postulada",
    badgeClassName: "border-accent/40 bg-accent/10 text-accent-soft",
    dotClassName: "bg-accent",
  },
  RESPONSE_RECEIVED: {
    label: "Respuesta recibida",
    badgeClassName: "border-accent-soft/40 bg-accent-soft/10 text-accent-soft",
    dotClassName: "bg-accent-soft",
  },
  INTERVIEW: {
    label: "Entrevista",
    badgeClassName: "border-warning/40 bg-warning/10 text-warning",
    dotClassName: "bg-warning",
  },
  OFFER: {
    label: "Oferta",
    badgeClassName: "border-success/40 bg-success/10 text-success",
    dotClassName: "bg-success",
  },
  REJECTED: {
    label: "Rechazada",
    badgeClassName: "border-danger/40 bg-danger/10 text-danger",
    dotClassName: "bg-danger",
  },
  CLOSED: {
    label: "Cerrada",
    badgeClassName: "border-line-strong bg-surface text-foreground-subtle",
    dotClassName: "bg-foreground-subtle",
  },
} satisfies Record<ApplicationStatus, ApplicationStatusPresentation>;

export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUSES.map(
  (status) => ({
    value: status,
    label: APPLICATION_STATUS_PRESENTATION[status].label,
  }),
);

export function getApplicationStatusPresentation(
  status: ApplicationStatus,
): ApplicationStatusPresentation {
  return APPLICATION_STATUS_PRESENTATION[status];
}
