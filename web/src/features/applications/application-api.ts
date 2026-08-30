import { apiRequest } from "../../lib/api-client";
import type {
  ApplicationFilters,
  ApplicationRecord,
  ApplicationWithEvents,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../../types/api";

export const applicationQueryKeys = {
  all: ["applications"] as const,

  lists: () => [...applicationQueryKeys.all, "list"] as const,

  list: (filters: ApplicationFilters = {}) =>
    [
      ...applicationQueryKeys.lists(),
      filters.status ?? null,
      filters.search?.trim() ?? "",
    ] as const,

  details: () => [...applicationQueryKeys.all, "detail"] as const,

  detail: (applicationId: string) =>
    [...applicationQueryKeys.details(), applicationId] as const,
};

export function fetchApplications(
  filters: ApplicationFilters = {},
): Promise<ApplicationRecord[]> {
  return apiRequest<ApplicationRecord[]>(buildApplicationListPath(filters));
}

export function fetchApplication(
  applicationId: string,
): Promise<ApplicationWithEvents> {
  const encodedApplicationId = encodeURIComponent(applicationId);

  return apiRequest<ApplicationWithEvents>(
    `/applications/${encodedApplicationId}`,
  );
}

export function createApplication(
  input: CreateApplicationInput,
): Promise<ApplicationRecord> {
  return apiRequest<ApplicationRecord>("/applications", {
    method: "POST",
    body: input,
  });
}

export function updateApplication(
  applicationId: string,
  input: UpdateApplicationInput,
): Promise<ApplicationRecord> {
  const encodedApplicationId = encodeURIComponent(applicationId);

  return apiRequest<ApplicationRecord>(
    `/applications/${encodedApplicationId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

function buildApplicationListPath(filters: ApplicationFilters): string {
  const searchParams = new URLSearchParams();
  const normalizedSearch = filters.search?.trim();

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  const queryString = searchParams.toString();

  if (!queryString) {
    return "/applications";
  }

  return `/applications?${queryString}`;
}
