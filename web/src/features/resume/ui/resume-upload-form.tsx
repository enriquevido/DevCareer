import { FileCode2, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  RESUME_FILE_ACCEPT,
  formatFileSize,
  validateResumeFile,
} from "../model/resume-file";

type ResumeUploadFormProps = {
  errorMessage: string | null;
  hasCurrentResume: boolean;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
};

export function ResumeUploadForm({
  errorMessage,
  hasCurrentResume,
  isUploading,
  onUpload,
}: ResumeUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileInputId = useId();
  const helpTextId = useId();
  const errorMessageId = useId();

  const visibleError = validationError ?? errorMessage;

  function openFilePicker(): void {
    fileInputRef.current?.click();
  }

  function clearSelectedFile(): void {
    setSelectedFile(null);
    setValidationError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextFile = event.currentTarget.files?.[0] ?? null;

    setSelectedFile(nextFile);

    if (!nextFile) {
      setValidationError(null);
      return;
    }

    setValidationError(validateResumeFile(nextFile));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!selectedFile) {
      setValidationError("Selecciona un archivo .tex antes de continuar.");
      return;
    }

    const nextValidationError = validateResumeFile(selectedFile);

    if (nextValidationError) {
      setValidationError(nextValidationError);
      return;
    }

    try {
      await onUpload(selectedFile);
      clearSelectedFile();
    } catch {
      // The parent exposes the request error through errorMessage.
    }
  }

  const submitLabel = hasCurrentResume ? "Reemplazar archivo" : "Cargar CV";

  return (
    <section
      aria-labelledby="resume-upload-title"
      className="border-y border-line py-5"
    >
      <form onSubmit={handleSubmit}>
        <div
          className={[
            "flex",
            "flex-col",
            "gap-4",
            "desktop:flex-row",
            "desktop:items-start",
            "desktop:justify-between",
          ].join(" ")}
        >
          <div className="max-w-2xl">
            <h2
              className="text-sm font-semibold text-foreground"
              id="resume-upload-title"
            >
              {hasCurrentResume ? "Reemplazar fuente" : "Cargar fuente"}
            </h2>

            <p
              className="mt-1 text-sm leading-6 text-foreground-muted"
              id={helpTextId}
            >
              Selecciona un documento LaTeX completo. Debe utilizar la extensión
              .tex y no superar 512 KiB.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <input
              accept={RESUME_FILE_ACCEPT}
              aria-describedby={
                visibleError ? `${helpTextId} ${errorMessageId}` : helpTextId
              }
              className="sr-only"
              disabled={isUploading}
              id={fileInputId}
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />

            <button
              className={[
                "inline-flex",
                "h-9",
                "items-center",
                "gap-2",
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
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent",
                "motion-reduce:transition-none",
              ].join(" ")}
              disabled={isUploading}
              onClick={openFilePicker}
              type="button"
            >
              <Upload aria-hidden="true" className="size-4" strokeWidth={1.8} />
              Seleccionar .tex
            </button>

            <button
              className={[
                "inline-flex",
                "h-9",
                "items-center",
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
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent-hover",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-canvas",
                "motion-reduce:transition-none",
              ].join(" ")}
              disabled={
                !selectedFile || Boolean(validationError) || isUploading
              }
              type="submit"
            >
              {isUploading ? "Cargando…" : submitLabel}
            </button>
          </div>
        </div>

        {selectedFile ? (
          <div
            className={[
              "mt-4",
              "flex",
              "min-w-0",
              "items-center",
              "gap-3",
              "border-t",
              "border-line",
              "pt-4",
            ].join(" ")}
          >
            <FileCode2
              aria-hidden="true"
              className="size-4 shrink-0 text-foreground-muted"
              strokeWidth={1.8}
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>

              <p className="mt-0.5 text-xs text-foreground-subtle">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              aria-label={`Quitar ${selectedFile.name}`}
              className={[
                "ml-auto",
                "grid",
                "size-8",
                "shrink-0",
                "place-items-center",
                "rounded-sm",
                "border-0",
                "bg-transparent",
                "p-0",
                "text-foreground-muted",
                "transition-colors",
                "duration-150",
                "hover:bg-surface-hover",
                "hover:text-foreground",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent",
                "motion-reduce:transition-none",
              ].join(" ")}
              disabled={isUploading}
              onClick={clearSelectedFile}
              type="button"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        ) : null}

        {visibleError ? (
          <p
            className="mt-3 text-sm leading-5 text-danger"
            id={errorMessageId}
            role="alert"
          >
            {visibleError}
          </p>
        ) : null}
      </form>
    </section>
  );
}
