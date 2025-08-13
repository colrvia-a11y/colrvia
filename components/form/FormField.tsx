import { Controller, useFormContext } from "react-hook-form";
import type { ReactNode } from "react";

type Props = {
  name: string;
  label: string;
  hint?: string;
  children: (p: { id: string; error?: string; field: any }) => ReactNode;
};

export function FormField({ name, label, hint, children }: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const id = `field-${name}`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const err = (errors as any)[name]?.message as string | undefined;
        return (
          <div className="space-y-1">
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
            {children({ id, error: err, field })}
            <p id={`${id}-hint`} className="text-xs text-neutral-500">
              {err ?? hint}
            </p>
          </div>
        );
      }}
    />
  );
}
