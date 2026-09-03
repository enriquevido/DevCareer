import type { IsoDateString } from "./common";

export const APPLICATION_STATUSES = [
  "DRAFT",
  "APPLIED",
  "RESPONSE_RECEIVED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "CLOSED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type TimelineEvent = {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  note: string | null;
  createdAt: IsoDateString;
};

export type ApplicationRecord = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl: string | null;
  description: string | null;
  location: string | null;
  isRemote: boolean;
  salaryRange: string | null;
  source: string | null;
  notes: string | null;
  status: ApplicationStatus;
  selectedCvAnalysisId: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type ApplicationWithEvents = ApplicationRecord & {
  events: TimelineEvent[];
};

export type CreateApplicationInput = {
  company: string;
  jobTitle: string;
  jobUrl?: string;
  description?: string;
  location?: string;
  isRemote?: boolean;
  salaryRange?: string;
  source?: string;
  notes?: string;
};

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

export type UpdateApplicationStatusInput = {
  status: ApplicationStatus;
  note?: string;
};

export type ApplicationFilters = {
  status?: ApplicationStatus;
  search?: string;
};

export type ChangeApplicationStatusResponse = [
  application: ApplicationRecord,
  event: TimelineEvent,
];
