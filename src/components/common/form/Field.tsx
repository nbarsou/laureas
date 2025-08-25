"use client";

import * as React from "react";
import clsx from "clsx";

type FieldKind = "input" | "textarea" | "select";

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  error?: string | null;
  helpText?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;

  /** Which control to render */
  as?: FieldKind;

  /** For inputs (text, email, number, date, password, etc.) */
  type?: React.HTMLInputTypeAttribute;

  /** For textarea rows */
  rows?: number;

  /** For <select> options (or any children you want inside) */
  children?: React.ReactNode;

  /** Pass-through HTML props; we’ll spread them where relevant */
  // (We accept a superset of attributes; duplicates are omitted below)
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "placeholder" | "disabled"
> &
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "name" | "placeholder" | "rows" | "disabled"
  > &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name" | "disabled">;

export const Field = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FieldProps
>(function Field(
  {
    label,
    name,
    placeholder,
    error,
    helpText,
    required,
    className,
    disabled,
    as = "input",
    type = "text",
    rows = 4,
    children,
    ...rest
  },
  ref
) {
  const id = React.useId();
  const fieldId = `${name}-${id}`;

  const base =
    "w-full rounded-md border px-3 py-2 text-sm outline-none transition";
  const normal = "border-black/10 bg-white focus:ring-2 focus:ring-black/20";
  const errored = "border-red-400 bg-white focus:ring-2 focus:ring-red-300";
  const disabledCls = "opacity-60 cursor-not-allowed";
  const borderCls = error ? errored : normal;

  const labelCls = "mb-1 block text-sm font-medium text-black";
  const msgBase = "mt-1 text-xs";
  const helpCls = "text-black/60";
  const errorCls = "text-red-600";

  let control: React.ReactNode;

  if (as === "textarea") {
    control = (
      <textarea
        id={fieldId}
        name={name}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${fieldId}-err` : helpText ? `${fieldId}-help` : undefined
        }
        className={clsx(base, borderCls, disabled && disabledCls)}
        disabled={disabled}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  } else if (as === "select") {
    control = (
      <select
        id={fieldId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${fieldId}-err` : helpText ? `${fieldId}-help` : undefined
        }
        className={clsx(base, borderCls, disabled && disabledCls)}
        disabled={disabled}
        ref={ref as React.Ref<HTMLSelectElement>}
        {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {children}
      </select>
    );
  } else {
    control = (
      <input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${fieldId}-err` : helpText ? `${fieldId}-help` : undefined
        }
        className={clsx(base, borderCls, disabled && disabledCls)}
        disabled={disabled}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      <label htmlFor={fieldId} className={labelCls}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {control}
      {!error && helpText && (
        <p id={`${fieldId}-help`} className={clsx(msgBase, helpCls)}>
          {helpText}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-err`} className={clsx(msgBase, errorCls)}>
          {error}
        </p>
      )}
    </div>
  );
});
