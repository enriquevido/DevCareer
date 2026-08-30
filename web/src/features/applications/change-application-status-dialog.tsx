import { ChevronDown } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type {
  ApplicationStatus,
  UpdateApplicationStatusInput,
} from "../../types/api";
import { APPLICATION_STATUS_OPTIONS } from "./application-status";

type ChangeApplicationStatusDialogProps = {
  currentStatus: ApplicationStatus;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: UpdateApplicationStatusInput) => void;
};

export function ChangeApplicationStatusDialog({
  currentStatus,
  errorMessage,
  isSubmitting,
  onCancel,
  onSubmit,
}: ChangeApplicationStatusDialogProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);

  const [note, setNote] = useState("");

  const hasStatusChanged = status !== currentStatus;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onCancel]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!hasStatusChanged || isSubmitting) {
      return;
    }

    const normalizedNote = note.trim();

    onSubmit({
      status,
      ...(normalizedNote ? { note: normalizedNote } : {}),
    });
  }

  return (
    <div
      className={[
        "fixed",
        "inset-0",
        "z-50",
        "flex",
        "items-center",
        "justify-center",
        "bg-black/70",
        "p-4",
      ].join(" ")}
    >
      <section
        aria-describedby="change-status-description"
        aria-labelledby="change-status-title"
        aria-modal="true"
        className="w-full max-w-lg border border-line-strong bg-surface-raised"
        role="dialog"
      >
        <header className="border-b border-line px-5 py-4">
          <h2
            id="change-status-title"
            className="text-base font-semibold text-foreground"
          >
            Cambiar estado
          </h2>

          <p
            id="change-status-description"
            className="mt-1 text-sm leading-6 text-foreground-muted"
          >
            El cambio quedará registrado en el historial de la postulación.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-5 py-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
                Estado nuevo
              </span>

              <span className="relative block">
                <select
                  autoFocus
                  className={[
                    "h-10",
                    "w-full",
                    "appearance-none",
                    "rounded-sm",
                    "border",
                    "border-line-strong",
                    "bg-sidebar",
                    "py-0",
                    "pr-10",
                    "pl-3",
                    "text-sm",
                    "text-foreground",
                    "outline-none",
                    "focus:border-accent",
                    "focus:ring-2",
                    "focus:ring-accent/30",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                  ].join(" ")}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setStatus(event.currentTarget.value as ApplicationStatus);
                  }}
                  value={status}
                >
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <option
                      disabled={option.value === currentStatus}
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                      {option.value === currentStatus ? " (actual)" : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  aria-hidden="true"
                  className={[
                    "pointer-events-none",
                    "absolute",
                    "top-1/2",
                    "right-3",
                    "size-4",
                    "-translate-y-1/2",
                    "text-foreground-muted",
                  ].join(" ")}
                  strokeWidth={1.8}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
                Nota
                <span className="font-normal text-foreground-subtle">
                  {" "}
                  (opcional)
                </span>
              </span>

              <textarea
                className={[
                  "min-h-28",
                  "w-full",
                  "resize-y",
                  "rounded-sm",
                  "border",
                  "border-line-strong",
                  "bg-sidebar",
                  "px-3",
                  "py-2.5",
                  "text-sm",
                  "leading-6",
                  "text-foreground",
                  "outline-none",
                  "placeholder:text-foreground-subtle",
                  "focus:border-accent",
                  "focus:ring-2",
                  "focus:ring-accent/30",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-50",
                ].join(" ")}
                disabled={isSubmitting}
                onChange={(event) => {
                  setNote(event.currentTarget.value);
                }}
                placeholder="Ejemplo: entrevista técnica agendada para el viernes."
                value={note}
              />
            </label>

            {errorMessage ? (
              <p
                className="border-l-2 border-danger pl-3 text-sm leading-6 text-danger"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <footer className="flex justify-end gap-2 border-t border-line px-5 py-4">
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
              disabled={!hasStatusChanged || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Guardando…" : "Guardar cambio"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
