import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "cn";
import { useController, useFormContext } from "react-hook-form";
import { FieldFrame, fieldControl } from "@/components/hook-form/field-frame";

type TextFieldProps = {
  name: string;
  label?: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "defaultValue">;

export function TextField({ name, label, hint, className, ...props }: TextFieldProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <FieldFrame label={label} error={fieldState.error?.message} hint={hint}>
      <input
        {...props}
        name={field.name}
        ref={field.ref}
        value={field.value ?? ""}
        onBlur={field.onBlur}
        onChange={field.onChange}
        className={cn(
          fieldControl,
          "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-mute dark:disabled:bg-ink-950",
          fieldState.error && "border-rose-500",
          className,
        )}
      />
    </FieldFrame>
  );
}
