"use client";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";

export function FieldError({ id, error }: { id: string; error?: string }) {
  return <p id={`${id}-hint`} className="mt-1 text-xs text-neutral-500">{error}</p>;
}

type FormFieldProps = {
  name: string;
  label: string;
  children: (p: { id: string; field: any; error?: string }) => React.ReactNode;
};
export function FormField({ name, label, children }: FormFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const id = `field-${name}`;
  const err = (errors as any)[name]?.message as string | undefined;
  return (
    <Controller name={name} control={control} render={({ field }) => (
      <div className="mb-4">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {children({ id, field, error: err })}
        <FieldError id={id} error={err} />
      </div>
    )}/>
  );
}
