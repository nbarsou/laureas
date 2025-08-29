"use client";

import clsx from "clsx";
import * as React from "react";

type Err = string | string[] | undefined;

export type DateFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "name"
> & {
  name: string;
  label: string;
  hint?: string;
  error?: Err;
  containerClassName?: string;
};

/**
 * Native date input with JS-driven color:
 * - Gray when empty
 * - Black after a date is picked
 */
export function DateField({
  name,
  label,
  hint,
  error,
  id,
  required,
  containerClassName,
  ...rest
}: DateFieldProps) {
  const inputId = id ?? name;
  const hasError = !!error?.length;
  const describedBy = hasError
    ? `${name}-error`
    : hint
    ? `${name}-hint`
    : undefined;

  // Pull possibly-controlled props so we can merge & observe them
  const { onChange, value, defaultValue, style, ...inputProps } = rest;

  // Determine if the field currently has a value
  const [hasValue, setHasValue] = React.useState<boolean>(() => {
    const v =
      (value as string | undefined) ??
      (defaultValue as string | undefined) ??
      "";
    return v !== "";
  });

  // If this becomes a controlled input, keep color in sync
  React.useEffect(() => {
    if (value !== undefined) {
      setHasValue(String(value ?? "") !== "");
    }
  }, [value]);

  // JS-on-change: make text black when user picks a date
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.currentTarget.value !== "");
    onChange?.(e); // forward to caller if they provided one
  };

  // Merge caller styles with our color override
  const mergedStyle = React.useMemo<React.CSSProperties>(
    () => ({
      ...style,
      // Tailwind gray-400 (#9CA3AF) when empty, gray-900 (#111827) when set
      color: hasValue ? "#111827" : "#8898aa",
    }),
    [style, hasValue]
  );

  return (
    <div className={clsx("space-y-1", containerClassName)}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <input
        id={inputId}
        name={name}
        type="date"
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        onChange={handleChange}
        style={mergedStyle} // <-- JS-applied text color
        className={clsx(
          "w-full rounded border px-3 py-2 outline-none",
          "focus:ring-2",
          hasError
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-black"
        )}
        value={value as any}
        defaultValue={defaultValue as any}
        {...inputProps}
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
