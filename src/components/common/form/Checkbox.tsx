// /components/common/form/Checkbox.tsx
"use client";
import * as React from "react";
import clsx from "clsx";

export function CheckboxField({
  label,
  name,
  error,
  helpText,
  className,
  defaultChecked,
  checked, // controlled
  onChange, // controlled
  inputRef, // forward ref for RHF
  disabled,
}: {
  label: string;
  name: string;
  error?: string;
  helpText?: string;
  className?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
}) {
  return (
    <div className={clsx("w-full", className)}>
      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          checked={checked}
          onChange={onChange}
          ref={inputRef}
          disabled={disabled}
          className="h-4 w-4 rounded border-black/30"
        />
        {label}
      </label>
      {!error && helpText && (
        <p className="mt-1 text-xs text-black/60">{helpText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
