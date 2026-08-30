import type { ApplicationRecord } from "../../types/api";

const APPLICATION_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const APPLICATION_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatApplicationDate(value: string): string {
  return formatDate(value, APPLICATION_DATE_FORMATTER);
}

export function formatApplicationDateTime(value: string): string {
  return formatDate(value, APPLICATION_DATE_TIME_FORMATTER);
}

export function getSafeApplicationUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function getApplicationWorkplaceLabel(
  application: ApplicationRecord,
): string | null {
  const location = application.location?.trim();

  const parts: string[] = [];

  if (location) {
    parts.push(location);
  }

  if (application.isRemote) {
    parts.push("Remoto");
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatDate(value: string, formatter: Intl.DateTimeFormat): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return formatter.format(date);
}
