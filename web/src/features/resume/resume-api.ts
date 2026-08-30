import { ApiError, apiRequest, getApiUrl } from "../../lib/api-client";
import type { ResumeVersion } from "../../types/api";

export const resumeQueryKeys = {
  all: ["resumes"] as const,

  current: () => [...resumeQueryKeys.all, "current"] as const,

  source: (resumeId: string) =>
    [...resumeQueryKeys.all, "source", resumeId] as const,
};

export async function fetchCurrentResume(): Promise<ResumeVersion | null> {
  try {
    return await apiRequest<ResumeVersion>("/resumes/current");
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function uploadResume(file: File): Promise<ResumeVersion> {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest<ResumeVersion>("/resumes", {
    method: "POST",
    body: formData,
  });
}

export function fetchResumeSource(resumeId: string): Promise<string> {
  const encodedResumeId = encodeURIComponent(resumeId);

  return apiRequest<string>(`/resumes/${encodedResumeId}/source`);
}

export function getResumeSourceDownloadUrl(resumeId: string): string {
  const encodedResumeId = encodeURIComponent(resumeId);

  return getApiUrl(`/resumes/${encodedResumeId}/source`);
}
