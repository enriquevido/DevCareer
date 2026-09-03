import type { ApplicationRecord } from "@/domain/application";

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
