import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { CvAnalysis } from "@/domain/cv-analysis";

type ConfirmCvSelectionDialogProps = {
  analysis: CvAnalysis;
  errorMessage: string | null;
  hasExistingSelection: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const DIALOG_TITLE_ID = "confirm-cv-selection-title";
const DIALOG_DESCRIPTION_ID = "confirm-cv-selection-description";

export function ConfirmCvSelectionDialog({
  analysis,
  errorMessage,
  hasExistingSelection,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmCvSelectionDialogProps) {
  return (
    <ModalDialog
      ariaDescribedBy={DIALOG_DESCRIPTION_ID}
      ariaLabelledBy={DIALOG_TITLE_ID}
      isDismissDisabled={isSubmitting}
      onClose={onCancel}
      panelClassName="max-w-md"
    >
      <header className="border-b border-line px-5 py-4">
        <h2
          className="text-base font-semibold text-foreground"
          id={DIALOG_TITLE_ID}
        >
          Seleccionar este CV
        </h2>

        <p
          className="mt-1 text-sm leading-6 text-foreground-muted"
          id={DIALOG_DESCRIPTION_ID}
        >
          Confirma qué versión del CV quedará asociada con esta postulación.
        </p>
      </header>

      <div className="space-y-4 px-5 py-5">
        <div className="border-l-2 border-accent pl-3">
          <p className="wrap-break-word text-sm font-semibold text-foreground">
            {analysis.application.company}
          </p>

          <p className="mt-1 wrap-break-word text-sm text-foreground-muted">
            {analysis.application.jobTitle}
          </p>
        </div>

        <p className="text-sm leading-6 text-foreground-muted">
          {hasExistingSelection
            ? "Esta versión reemplazará el CV seleccionado actualmente para la postulación."
            : "Esta versión quedará registrada como el CV utilizado para la postulación."}
        </p>

        <dl className="grid gap-3 border-y border-line py-4 text-sm">
          <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-foreground-subtle">Documento fuente</dt>

            <dd className="wrap-break-word text-foreground">
              {analysis.resumeVersion.originalName}
            </dd>
          </div>

          <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3">
            <dt className="text-foreground-subtle">Modelo</dt>

            <dd className="break-all font-mono text-foreground" translate="no">
              {analysis.model}
            </dd>
          </div>
        </dl>

        <p className="text-sm leading-6 text-foreground-muted">
          El CV maestro no será modificado. Sólo cambiará la versión asociada
          con esta postulación.
        </p>

        {errorMessage ? (
          <div
            aria-live="polite"
            className="border-l-2 border-danger pl-3"
            role="alert"
          >
            <p className="text-sm font-medium text-danger">
              No pudimos seleccionar el CV
            </p>

            <p className="mt-1 text-sm leading-6 text-foreground-muted">
              {errorMessage}
            </p>
          </div>
        ) : null}
      </div>

      <footer
        className={[
          "flex",
          "flex-col-reverse",
          "gap-2",
          "border-t",
          "border-line",
          "px-5",
          "py-4",
          "sm:flex-row",
          "sm:justify-end",
        ].join(" ")}
      >
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
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>

        <button
          className={[
            "inline-flex",
            "h-9",
            "items-center",
            "justify-center",
            "rounded-sm",
            "border",
            "border-accent",
            "bg-accent",
            "px-3",
            "text-sm",
            "font-medium",
            "text-white",
            "transition-colors",
            "duration-150",
            "hover:border-accent-hover",
            "hover:bg-accent-hover",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent-hover",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          {isSubmitting ? "Seleccionando…" : "Confirmar selección"}
        </button>
      </footer>
    </ModalDialog>
  );
}
