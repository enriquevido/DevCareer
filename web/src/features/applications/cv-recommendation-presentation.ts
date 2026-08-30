import type {
  ReplacementRejectionReason,
  ReplacementStatus,
} from "../../types/api";

export type ReplacementStatusPresentation = {
  badgeClassName: string;
  label: string;
};

const REPLACEMENT_STATUS_PRESENTATION = {
  APPLIED: {
    label: "Aplicado",
    badgeClassName: "border-success/40 bg-success/10 text-success",
  },
  REJECTED: {
    label: "Rechazado",
    badgeClassName: "border-warning/40 bg-warning/10 text-warning",
  },
} satisfies Record<ReplacementStatus, ReplacementStatusPresentation>;

const REPLACEMENT_REJECTION_REASON_LABELS = {
  ORIGINAL_NOT_FOUND:
    "El texto original no se encontró en el documento fuente.",
  ORIGINAL_NOT_UNIQUE:
    "El texto original aparece más de una vez y no puede reemplazarse con seguridad.",
  IDENTICAL_REPLACEMENT: "El texto propuesto es idéntico al texto original.",
  OVERLAPPING_REPLACEMENT:
    "El cambio se superpone con otro reemplazo aplicado.",
} satisfies Record<ReplacementRejectionReason, string>;

export function getReplacementStatusPresentation(
  status: ReplacementStatus,
): ReplacementStatusPresentation {
  return REPLACEMENT_STATUS_PRESENTATION[status];
}

export function getReplacementRejectionReasonLabel(
  reason: ReplacementRejectionReason | null,
): string | null {
  if (!reason) {
    return null;
  }

  return REPLACEMENT_REJECTION_REASON_LABELS[reason];
}
