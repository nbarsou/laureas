// /components/common/form/rhf.tsx
"use client";

import * as React from "react";
import {
  Control,
  FieldValues,
  FieldPath,
  useController,
} from "react-hook-form";
import { Field } from "@/components/common/form/Field";
import { CheckboxField } from "@/components/common/form/Checkbox";

type Base<TFieldValues extends FieldValues> = {
  /** dot-path into form values, e.g. "settings.groupsCount" */
  name: FieldPath<TFieldValues>;
  label: string;
  helpText?: string;
  className?: string;
};

/** Text/number/date/select/textarea wrapper */
export function RHFField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helpText,
  className,
  as = "input",
  type = "text",
  ...rest
}: Base<TFieldValues> & {
  /** RHF control; note the 3 generics in v7.62 */
  control: Control<TFieldValues, any, TFieldValues>;
  as?: "input" | "textarea" | "select";
  type?: React.HTMLInputTypeAttribute;
} & Omit<
    React.ComponentProps<typeof Field>,
    "name" | "label" | "helpText" | "className" | "as" | "type"
  >) {
  const { field, fieldState } = useController<
    TFieldValues,
    FieldPath<TFieldValues>,
    TFieldValues
  >({
    control,
    name,
  });

  return (
    <Field
      {...rest}
      as={as}
      type={type}
      name={name as unknown as string} /* Field expects string; path is fine */
      label={label}
      className={className}
      helpText={helpText}
      error={fieldState.error?.message}
      ref={field.ref as any}
      value={field.value ?? ""} /* keep controlled; '' works for input/select */
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}

/** Checkbox wrapper */
export function RHFCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  helpText,
  className,
  defaultChecked,
}: Base<TFieldValues> & {
  control: Control<TFieldValues, any, TFieldValues>;
  defaultChecked?: boolean;
}) {
  const { field, fieldState } = useController<
    TFieldValues,
    FieldPath<TFieldValues>,
    TFieldValues
  >({
    control,
    name,
  });

  return (
    <CheckboxField
      name={name as unknown as string}
      label={label}
      helpText={helpText}
      className={className}
      error={fieldState.error?.message}
      checked={!!field.value}
      onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
      inputRef={field.ref}
      defaultChecked={defaultChecked}
    />
  );
}
