import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ApplicationRemoteField,
  ApplicationTextareaField,
  ApplicationTextField,
} from "./application-form-fields";
import {
  hasApplicationFormChanges,
  validateApplicationForm,
} from "../model/application-form-model";
import type {
  ApplicationFormErrors,
  ApplicationFormMode,
  ApplicationFormTextField,
  ApplicationFormValues,
} from "../model/application-form-model";

type ApplicationFormProps = {
  initialValues: ApplicationFormValues;
  isSubmitting: boolean;
  mode: ApplicationFormMode;
  onCancel: () => void;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  serverError: string | null;
};

const APPLICATION_FORM_FIELD_ORDER = [
  "company",
  "jobTitle",
  "jobUrl",
  "source",
  "location",
  "salaryRange",
  "description",
  "notes",
] as const satisfies readonly ApplicationFormTextField[];

export function ApplicationForm({
  initialValues,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  serverError,
}: ApplicationFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<ApplicationFormValues>(() => ({
    ...initialValues,
  }));

  const [errors, setErrors] = useState<ApplicationFormErrors>({});

  const hasChanges =
    mode === "create" || hasApplicationFormChanges(values, initialValues);

  function getFieldId(field: ApplicationFormTextField): string {
    return `${formId}-${field}`;
  }

  function focusFirstInvalidField(
    validationErrors: ApplicationFormErrors,
  ): void {
    const firstInvalidField = APPLICATION_FORM_FIELD_ORDER.find(
      (field) => validationErrors[field],
    );

    if (!firstInvalidField) {
      return;
    }

    window.requestAnimationFrame(() => {
      const form = formRef.current;

      if (!form) {
        return;
      }

      const fieldElement = form.elements.namedItem(firstInvalidField);

      if (fieldElement instanceof HTMLElement) {
        fieldElement.focus();
      }
    });
  }

  function handleTextFieldChange(
    field: ApplicationFormTextField,
    value: string,
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[field];

      return nextErrors;
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const nextErrors = validateApplicationForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstInvalidField(nextErrors);
      return;
    }

    setErrors({});

    try {
      await onSubmit(values);
    } catch {
      // The parent exposes the request error
      // through the serverError property.
    }
  }

  const submitLabel =
    mode === "create" ? "Crear postulación" : "Guardar cambios";

  return (
    <form
      aria-busy={isSubmitting}
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <section
        aria-labelledby={`${formId}-identity-title`}
        className="border-b border-line py-5"
      >
        <div className="mb-5">
          <h2
            className="text-sm font-semibold text-foreground"
            id={`${formId}-identity-title`}
          >
            Información de la vacante
          </h2>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            Empresa, puesto y referencia original de la oportunidad.
          </p>
        </div>

        <div className="grid gap-5 desktop:grid-cols-2">
          <ApplicationTextField
            autoComplete="organization"
            disabled={isSubmitting}
            error={errors.company}
            field="company"
            id={getFieldId("company")}
            label="Empresa"
            onChange={handleTextFieldChange}
            placeholder="Nombre de la empresa"
            value={values.company}
          />

          <ApplicationTextField
            autoComplete="organization-title"
            disabled={isSubmitting}
            error={errors.jobTitle}
            field="jobTitle"
            id={getFieldId("jobTitle")}
            label="Puesto"
            onChange={handleTextFieldChange}
            placeholder="Título de la vacante"
            value={values.jobTitle}
          />

          <ApplicationTextField
            autoComplete="url"
            disabled={isSubmitting}
            error={errors.jobUrl}
            field="jobUrl"
            id={getFieldId("jobUrl")}
            label="URL de la vacante"
            onChange={handleTextFieldChange}
            placeholder="https://…"
            type="url"
            value={values.jobUrl}
          />

          <ApplicationTextField
            disabled={isSubmitting}
            error={errors.source}
            field="source"
            id={getFieldId("source")}
            label="Fuente"
            onChange={handleTextFieldChange}
            placeholder="LinkedIn, sitio de la empresa…"
            value={values.source}
          />
        </div>
      </section>

      <section
        aria-labelledby={`${formId}-conditions-title`}
        className="border-b border-line py-5"
      >
        <div className="mb-5">
          <h2
            className="text-sm font-semibold text-foreground"
            id={`${formId}-conditions-title`}
          >
            Condiciones
          </h2>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            Ubicación, modalidad y compensación publicada.
          </p>
        </div>

        <div
          className={[
            "grid",
            "gap-5",
            "desktop:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)]",
            "desktop:items-end",
          ].join(" ")}
        >
          <ApplicationTextField
            autoComplete="address-level2"
            disabled={isSubmitting}
            error={errors.location}
            field="location"
            id={getFieldId("location")}
            label="Ubicación"
            onChange={handleTextFieldChange}
            placeholder="Ciudad, estado o país"
            value={values.location}
          />

          <ApplicationRemoteField
            checked={values.isRemote}
            disabled={isSubmitting}
            id={`${formId}-isRemote`}
            onChange={(checked) => {
              setValues((currentValues) => ({
                ...currentValues,
                isRemote: checked,
              }));
            }}
          />

          <ApplicationTextField
            disabled={isSubmitting}
            error={errors.salaryRange}
            field="salaryRange"
            id={getFieldId("salaryRange")}
            label="Rango salarial"
            onChange={handleTextFieldChange}
            placeholder="$50,000 – $70,000 MXN"
            value={values.salaryRange}
          />
        </div>
      </section>

      <section
        aria-labelledby={`${formId}-context-title`}
        className="border-b border-line py-5"
      >
        <div className="mb-5">
          <h2
            className="text-sm font-semibold text-foreground"
            id={`${formId}-context-title`}
          >
            Contexto
          </h2>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            Información necesaria para evaluar y dar seguimiento a la
            oportunidad.
          </p>
        </div>

        <div className="space-y-5">
          <ApplicationTextareaField
            disabled={isSubmitting}
            error={errors.description}
            field="description"
            helperText="Puede guardarse vacía, pero será necesaria antes de generar un análisis del CV."
            id={getFieldId("description")}
            label="Descripción de la vacante"
            minHeightClassName="min-h-56"
            onChange={handleTextFieldChange}
            placeholder="Responsabilidades, requisitos y contexto del puesto…"
            value={values.description}
          />

          <ApplicationTextareaField
            disabled={isSubmitting}
            error={errors.notes}
            field="notes"
            helperText="Notas privadas sobre el proceso, contactos o próximos pasos."
            id={getFieldId("notes")}
            label="Notas"
            minHeightClassName="min-h-32"
            onChange={handleTextFieldChange}
            placeholder="Información útil para tu seguimiento…"
            value={values.notes}
          />
        </div>
      </section>

      {serverError ? (
        <div
          aria-live="polite"
          className="border-b border-line py-4"
          role="alert"
        >
          <p className="text-sm font-medium text-danger">
            No pudimos guardar la postulación
          </p>

          <p className="mt-1 text-sm leading-6 text-foreground-muted">
            {serverError}
          </p>
        </div>
      ) : null}

      <footer
        className={[
          "flex",
          "flex-col-reverse",
          "gap-2",
          "py-5",
          "sm:flex-row",
          "sm:items-center",
          "sm:justify-end",
        ].join(" ")}
      >
        <button
          className={[
            "inline-flex",
            "h-9",
            "items-center",
            "justify-center",
            "rounded-sm",
            "border",
            "border-line-strong",
            "bg-transparent",
            "px-3",
            "text-sm",
            "font-medium",
            "text-foreground",
            "transition-colors",
            "duration-150",
            "hover:bg-surface-hover",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>

        <button
          className={[
            "inline-flex",
            "h-9",
            "items-center",
            "justify-center",
            "rounded-sm",
            "border",
            "border-accent",
            "bg-accent",
            "px-3",
            "text-sm",
            "font-medium",
            "text-white",
            "transition-colors",
            "duration-150",
            "hover:border-accent-hover",
            "hover:bg-accent-hover",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent-hover",
            "focus-visible:ring-offset-2",
            "focus-visible:ring-offset-canvas",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            "motion-reduce:transition-none",
          ].join(" ")}
          disabled={isSubmitting || !hasChanges}
          type="submit"
        >
          {isSubmitting ? "Guardando…" : submitLabel}
        </button>
      </footer>
    </form>
  );
}
