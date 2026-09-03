const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string): string {
  return formatWith(value, DATE_FORMATTER);
}

export function formatDateTime(value: string): string {
  return formatWith(value, DATE_TIME_FORMATTER);
}

function formatWith(value: string, formatter: Intl.DateTimeFormat): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return formatter.format(date);
}
