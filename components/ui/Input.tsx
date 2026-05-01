"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import "./ui.css";

interface BaseFieldProps {
  label?: ReactNode;
  required?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  containerClassName?: string;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, required, error, hint, containerClassName, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `ui-input-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={["ui-field", containerClassName ?? ""].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className="ui-field__label">
          {label}
          {required ? <span className="required" aria-hidden>*</span> : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={["ui-input", className ?? ""].filter(Boolean).join(" ")}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...rest}
      />
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

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, required, error, hint, containerClassName, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `ui-textarea-${reactId}`;
  const hasError = Boolean(error);

  return (
    <div className={["ui-field", containerClassName ?? ""].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className="ui-field__label">
          {label}
          {required ? <span className="required" aria-hidden>*</span> : null}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        className={["ui-input", "ui-input--textarea", className ?? ""].filter(Boolean).join(" ")}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...rest}
      />
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

export default Input;
