import { ApiError } from "@/shared/api/http-client";

const RESUME_UPLOAD_ERROR_MESSAGES = {
  INVALID_FILE_NAME: "El nombre del archivo no es válido.",
  INVALID_EXTENSION: "El archivo debe tener extensión .tex.",
  EMPTY_FILE: "El archivo no puede estar vacío.",
  FILE_TOO_LARGE: "El archivo no puede superar 512 KiB.",
  INVALID_UTF8: "El archivo debe contener texto UTF-8 válido.",
  BINARY_CONTENT: "El archivo contiene caracteres de control no permitidos.",
  INVALID_LATEX_DOCUMENT: "El archivo debe ser un documento LaTeX completo.",
} as const;

type ResumeUploadErrorCode = keyof typeof RESUME_UPLOAD_ERROR_MESSAGES;

function getApiErrorCode(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null || !("code" in payload)) {
    return null;
  }

  return typeof payload.code === "string" ? payload.code : null;
}

function isResumeUploadErrorCode(code: string): code is ResumeUploadErrorCode {
  return Object.hasOwn(RESUME_UPLOAD_ERROR_MESSAGES, code);
}

export function getResumeErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError) {
    const errorCode = getApiErrorCode(error.payload);

    if (errorCode && isResumeUploadErrorCode(errorCode)) {
      return RESUME_UPLOAD_ERROR_MESSAGES[errorCode];
    }

    if (error.status === 404) {
      return "La versión solicitada ya no está disponible.";
    }

    if (error.status === 413) {
      return "El archivo no puede superar 512 KiB.";
    }

    if (error.status >= 500) {
      return "El servidor encontró un problema. Intenta nuevamente.";
    }
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con el servidor. Revisa que la API esté disponible.";
  }

  return fallbackMessage;
}
