"use client";

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import "./ui.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  required?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  containerClassName?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, required, error, hint, containerClassName, id, className, options, children, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `ui-select-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={["ui-field", containerClassName ?? ""].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className="ui-field__label">
          {label}
          {required ? <span className="required" aria-hidden>*</span> : null}
        </label>
      ) : null}
      <div className="ui-select">
        <select
          ref={ref}
          id={inputId}
          className={["ui-input", "ui-select__input", className ?? ""].filter(Boolean).join(" ")}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          required={required}
          {...rest}
        >
          {children ??
            options?.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
        </select>
        <svg
          className="ui-select__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {hasError ? (
        <span id={`${inputId}-error`} className="ui-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="ui-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
});

export default Select;
