import { ApiError } from "@/shared/api/http-client";

export function getCvAnalysisErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "La solicitud contiene datos inválidos. Revisa la información enviada.";
    }

    if (error.status === 404) {
      return "No encontramos la postulación, el análisis o la versión del CV solicitada.";
    }

    if (error.status === 409) {
      return "El análisis todavía no puede completar esta operación.";
    }

    if (error.status === 422) {
      return "Falta información necesaria o el análisis no pertenece a esta postulación.";
    }

    if (error.status >= 500) {
      return "El servidor encontró un problema durante el análisis. Intenta nuevamente.";
    }
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con el servidor. Revisa que la API esté disponible.";
  }

  return fallbackMessage;
}
