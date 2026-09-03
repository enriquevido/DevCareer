import { apiRequest } from "@/shared/api/http-client";
import type {
  ApplicationFilters,
  ApplicationRecord,
  ApplicationWithEvents,
  ChangeApplicationStatusResponse,
  CreateApplicationInput,
  UpdateApplicationInput,
  UpdateApplicationStatusInput,
} from "@/domain/application";

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
  return apiRequest<ApplicationWithEvents>(buildApplicationPath(applicationId));
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
  return apiRequest<ApplicationRecord>(buildApplicationPath(applicationId), {
    method: "PATCH",
    body: input,
  });
}

export function changeApplicationStatus(
  applicationId: string,
  input: UpdateApplicationStatusInput,
): Promise<ChangeApplicationStatusResponse> {
  return apiRequest<ChangeApplicationStatusResponse>(
    `${buildApplicationPath(applicationId)}/status`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export function deleteApplication(
  applicationId: string,
): Promise<ApplicationRecord> {
  return apiRequest<ApplicationRecord>(buildApplicationPath(applicationId), {
    method: "DELETE",
  });
}

function buildApplicationPath(applicationId: string): string {
  const encodedApplicationId = encodeURIComponent(applicationId);

  return `/applications/${encodedApplicationId}`;
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
