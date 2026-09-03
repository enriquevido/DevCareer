import { ModalDialog } from "@/shared/ui/modal-dialog";
import type { ApplicationRecord } from "@/domain/application";

type DeleteApplicationDialogProps = {
  application: Pick<ApplicationRecord, "company" | "jobTitle">;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const DIALOG_TITLE_ID = "delete-application-title";
const DIALOG_DESCRIPTION_ID = "delete-application-description";

export function DeleteApplicationDialog({
  application,
  errorMessage,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteApplicationDialogProps) {
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
          Eliminar postulación
        </h2>

        <p
          className="mt-1 text-sm leading-6 text-foreground-muted"
          id={DIALOG_DESCRIPTION_ID}
        >
          Revisa el expediente antes de confirmar esta acción permanente.
        </p>
      </header>

      <div className="space-y-4 px-5 py-5">
        <div className="border-l-2 border-danger pl-3">
          <p className="wrap-break-word text-sm font-semibold text-foreground">
            {application.company}
          </p>

          <p className="mt-1 wrap-break-word text-sm text-foreground-muted">
            {application.jobTitle}
          </p>
        </div>

        <p className="text-sm leading-6 text-foreground-muted">
          Se eliminarán la postulación, su historial de estados y los análisis
          relacionados de acuerdo con las reglas del servidor.
        </p>

        <p className="text-sm font-medium leading-6 text-danger">
          Esta acción no se puede deshacer.
        </p>

        {errorMessage ? (
          <div
            aria-live="polite"
            className="border-l-2 border-danger pl-3"
            role="alert"
          >
            <p className="text-sm font-medium text-danger">
              No pudimos eliminar la postulación
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
            "border-danger/60",
            "bg-danger/10",
            "px-3",
            "text-sm",
            "font-medium",
            "text-danger",
            "transition-colors",
            "duration-150",
            "hover:border-danger",
            "hover:bg-danger/20",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-danger",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          {isSubmitting ? "Eliminando…" : "Eliminar postulación"}
        </button>
      </footer>
    </ModalDialog>
  );
}
