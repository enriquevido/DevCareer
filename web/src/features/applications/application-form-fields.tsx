import type { HTMLInputTypeAttribute } from "react";
import type { ApplicationFormTextField } from "./application-form-model";

type FieldChangeHandler = (
  field: ApplicationFormTextField,
  value: string,
) => void;

type ApplicationTextFieldProps = {
  autoComplete?: string;
  disabled: boolean;
  error?: string;
  field: ApplicationFormTextField;
  id: string;
  label: string;
  onChange: FieldChangeHandler;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
};

type ApplicationTextareaFieldProps = {
  disabled: boolean;
  error?: string;
  field: ApplicationFormTextField;
  helperText?: string;
  id: string;
  label: string;
  minHeightClassName: string;
  onChange: FieldChangeHandler;
  placeholder?: string;
  value: string;
};

type ApplicationRemoteFieldProps = {
  checked: boolean;
  disabled: boolean;
  id: string;
  onChange: (checked: boolean) => void;
};

const LABEL_CLASS_NAME = [
  "mb-1.5",
  "block",
  "text-xs",
  "font-medium",
  "text-foreground-muted",
].join(" ");

const INPUT_CLASS_NAME = [
  "h-9",
  "w-full",
  "rounded-sm",
  "border",
  "border-line-strong",
  "bg-sidebar",
  "px-3",
  "text-sm",
  "text-foreground",
  "outline-none",
  "placeholder:text-foreground-subtle",
  "focus:border-accent",
  "focus:ring-2",
  "focus:ring-accent/30",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "aria-invalid:border-danger",
  "aria-invalid:focus:ring-danger/30",
].join(" ");

const TEXTAREA_CLASS_NAME = [
  "w-full",
  "resize-y",
  "rounded-sm",
  "border",
  "border-line-strong",
  "bg-sidebar",
  "px-3",
  "py-2.5",
  "text-sm",
  "leading-6",
  "text-foreground",
  "outline-none",
  "placeholder:text-foreground-subtle",
  "focus:border-accent",
  "focus:ring-2",
  "focus:ring-accent/30",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "aria-invalid:border-danger",
  "aria-invalid:focus:ring-danger/30",
].join(" ");

export function ApplicationTextField({
  autoComplete,
  disabled,
  error,
  field,
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: ApplicationTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className={LABEL_CLASS_NAME} htmlFor={id}>
        {label}
      </label>

      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={INPUT_CLASS_NAME}
        disabled={disabled}
        id={id}
        name={field}
        onChange={(event) => {
          onChange(field, event.currentTarget.value);
        }}
        placeholder={placeholder}
        type={type}
        value={value}
      />

      {error ? (
        <p
          className="mt-1.5 text-xs leading-5 text-danger"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApplicationTextareaField({
  disabled,
  error,
  field,
  helperText,
  id,
  label,
  minHeightClassName,
  onChange,
  placeholder,
  value,
}: ApplicationTextareaFieldProps) {
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;

  const describedBy = [helperText ? helperId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label className={LABEL_CLASS_NAME} htmlFor={id}>
        {label}
      </label>

      {helperText ? (
        <p
          className="mb-2 text-xs leading-5 text-foreground-subtle"
          id={helperId}
        >
          {helperText}
        </p>
      ) : null}

      <textarea
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={[TEXTAREA_CLASS_NAME, minHeightClassName].join(" ")}
        disabled={disabled}
        id={id}
        name={field}
        onChange={(event) => {
          onChange(field, event.currentTarget.value);
        }}
        placeholder={placeholder}
        value={value}
      />

      {error ? (
        <p
          className="mt-1.5 text-xs leading-5 text-danger"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApplicationRemoteField({
  checked,
  disabled,
  id,
  onChange,
}: ApplicationRemoteFieldProps) {
  return (
    <div>
      <span className={LABEL_CLASS_NAME}>Modalidad</span>

      <label
        className={[
          "flex",
          "h-9",
          "items-center",
          "gap-2.5",
          "rounded-sm",
          "border",
          "border-line-strong",
          "bg-sidebar",
          "px-3",
          "text-sm",
          "text-foreground",
          "transition-colors",
          "duration-150",
          "hover:bg-surface-hover",
          "motion-reduce:transition-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
        htmlFor={id}
      >
        <input
          checked={checked}
          className={[
            "size-4",
            "shrink-0",
            "accent-accent",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-accent",
          ].join(" ")}
          disabled={disabled}
          id={id}
          name="isRemote"
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
          type="checkbox"
        />
        Trabajo remoto
      </label>
    </div>
  );
}
