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

function formatDate(value: string, formatter: Intl.DateTimeFormat): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return formatter.format(date);
}
