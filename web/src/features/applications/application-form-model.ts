import type {
  ApplicationRecord,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../../types/api";

export type ApplicationFormMode = "create" | "edit";

export type ApplicationFormValues = {
  company: string;
  jobTitle: string;
  jobUrl: string;
  source: string;
  location: string;
  isRemote: boolean;
  salaryRange: string;
  description: string;
  notes: string;
};

export type ApplicationFormTextField = Exclude<
  keyof ApplicationFormValues,
  "isRemote"
>;

export type ApplicationFormErrors = Partial<
  Record<ApplicationFormTextField, string>
>;

export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    company: "",
    jobTitle: "",
    jobUrl: "",
    source: "",
    location: "",
    isRemote: false,
    salaryRange: "",
    description: "",
    notes: "",
  };
}

export function getApplicationFormValues(
  application: ApplicationRecord,
): ApplicationFormValues {
  return {
    company: application.company,
    jobTitle: application.jobTitle,
    jobUrl: application.jobUrl ?? "",
    source: application.source ?? "",
    location: application.location ?? "",
    isRemote: application.isRemote,
    salaryRange: application.salaryRange ?? "",
    description: application.description ?? "",
    notes: application.notes ?? "",
  };
}

export function validateApplicationForm(
  values: ApplicationFormValues,
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};

  if (values.company.trim().length === 0) {
    errors.company = "Escribe el nombre de la empresa.";
  }

  if (values.jobTitle.trim().length === 0) {
    errors.jobTitle = "Escribe el título del puesto.";
  }

  const normalizedJobUrl = values.jobUrl.trim();

  if (normalizedJobUrl && !isValidHttpUrl(normalizedJobUrl)) {
    errors.jobUrl =
      "Escribe una URL válida que comience con http:// o https://.";
  }

  return errors;
}

export function toCreateApplicationInput(
  values: ApplicationFormValues,
): CreateApplicationInput {
  const normalized = normalizeApplicationFormValues(values);

  return {
    company: normalized.company,
    jobTitle: normalized.jobTitle,
    isRemote: normalized.isRemote,
    ...(normalized.jobUrl ? { jobUrl: normalized.jobUrl } : {}),
    ...(normalized.source ? { source: normalized.source } : {}),
    ...(normalized.location ? { location: normalized.location } : {}),
    ...(normalized.salaryRange ? { salaryRange: normalized.salaryRange } : {}),
    ...(normalized.description ? { description: normalized.description } : {}),
    ...(normalized.notes ? { notes: normalized.notes } : {}),
  };
}

export function toUpdateApplicationInput(
  values: ApplicationFormValues,
  initialValues: ApplicationFormValues,
): UpdateApplicationInput {
  const current = normalizeApplicationFormValues(values);

  const initial = normalizeApplicationFormValues(initialValues);

  const input: UpdateApplicationInput = {};

  if (current.company !== initial.company) {
    input.company = current.company;
  }

  if (current.jobTitle !== initial.jobTitle) {
    input.jobTitle = current.jobTitle;
  }

  if (current.jobUrl !== initial.jobUrl) {
    input.jobUrl = current.jobUrl;
  }

  if (current.source !== initial.source) {
    input.source = current.source;
  }

  if (current.location !== initial.location) {
    input.location = current.location;
  }

  if (current.isRemote !== initial.isRemote) {
    input.isRemote = current.isRemote;
  }

  if (current.salaryRange !== initial.salaryRange) {
    input.salaryRange = current.salaryRange;
  }

  if (current.description !== initial.description) {
    input.description = current.description;
  }

  if (current.notes !== initial.notes) {
    input.notes = current.notes;
  }

  return input;
}

export function hasApplicationFormChanges(
  values: ApplicationFormValues,
  initialValues: ApplicationFormValues,
): boolean {
  const current = normalizeApplicationFormValues(values);

  const initial = normalizeApplicationFormValues(initialValues);

  return (
    current.company !== initial.company ||
    current.jobTitle !== initial.jobTitle ||
    current.jobUrl !== initial.jobUrl ||
    current.source !== initial.source ||
    current.location !== initial.location ||
    current.isRemote !== initial.isRemote ||
    current.salaryRange !== initial.salaryRange ||
    current.description !== initial.description ||
    current.notes !== initial.notes
  );
}

function normalizeApplicationFormValues(
  values: ApplicationFormValues,
): ApplicationFormValues {
  return {
    company: values.company.trim(),
    jobTitle: values.jobTitle.trim(),
    jobUrl: values.jobUrl.trim(),
    source: values.source.trim(),
    location: values.location.trim(),
    isRemote: values.isRemote,
    salaryRange: values.salaryRange.trim(),
    description: values.description.trim(),
    notes: values.notes.trim(),
  };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
