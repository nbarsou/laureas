"use client";

import { Switch } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";

type Err = string | string[] | undefined;

export type SwitchFieldProps = {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean; // optional controlled
  onChange?: (checked: boolean) => void;
  error?: Err;
  disabled?: boolean;
  className?: string;
};

/**
 * Headless UI switch + hidden input so it works with <form action={...}> posts.
 * Very basic visuals. Accessible labels + error text.
 */
export function SwitchField({
  name,
  label,
  description,
  defaultChecked,
  checked,
  onChange,
  error,
  disabled,
  className,
}: SwitchFieldProps) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const current = isControlled ? !!checked : internal;

  const set = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const describedById = error?.length
    ? `${name}-error`
    : description
    ? `${name}-desc`
    : undefined;

  return (
    <div className={clsx("space-y-1", className)}>
      <label className="block text-sm font-medium" htmlFor={`${name}-switch`}>
        {label}
      </label>

      <div className="flex items-center gap-3">
        <Switch
          id={`${name}-switch`}
          checked={current}
          onChange={set}
          disabled={disabled}
          aria-describedby={describedById}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            current ? "bg-black/90" : "bg-gray-300",
            error?.length ? "ring-1 ring-red-500" : "ring-1 ring-transparent"
          )}
        >
          <span
            className={clsx(
              "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
              current ? "translate-x-5" : "translate-x-1"
            )}
          />
        </Switch>

        {/* hidden input so the value posts with the form */}
        <input type="hidden" name={name} value={current ? "true" : "false"} />
      </div>

      {description && !error?.length && (
        <p id={`${name}-desc`} className="text-xs text-gray-600">
          {description}
        </p>
      )}

      {!!error?.length && (
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
