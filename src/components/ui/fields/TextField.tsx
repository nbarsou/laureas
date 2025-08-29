"use client";

import clsx from "clsx";
import * as React from "react";

type Err = string | string[] | undefined;

export type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "name"
> & {
  name: string;
  label: string;
  hint?: string;
  error?: Err;
  type?: "text" | "email" | "password" | "search";
  containerClassName?: string;
};

/**
 * Basic text input + label + error. Sticky values come from `defaultValue`.
 */
export function TextField({
  name,
  label,
  hint,
  error,
  type = "text",
  containerClassName,
  id,
  required,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? name;
  const hasError = !!error?.length;
  const describedBy = hasError
    ? `${name}-error`
    : hint
    ? `${name}-hint`
    : undefined;

  return (
    <div className={clsx("space-y-1", containerClassName)}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={clsx(
          "w-full rounded border px-3 py-2 outline-none",
          "focus:ring-2",
          hasError
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-black"
        )}
        {...rest}
      />

      {!hasError && hint && (
        <p id={`${name}-hint`} className="text-xs text-gray-600">
          {hint}
        </p>
      )}

      {hasError && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {Array.isArray(error) ? error.join(", ") : error}
        </p>
      )}
    </div>
  );
}
