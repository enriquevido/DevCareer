import { ApiError } from "@/shared/api/http-client";

export function getApplicationErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "Los datos enviados no son válidos. Revisa el formulario.";
    }

    if (error.status === 404) {
      return "La postulación solicitada ya no está disponible.";
    }

    if (error.status === 409) {
      return "La operación entra en conflicto con el estado actual de la postulación.";
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
