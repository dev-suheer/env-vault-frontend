import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "cn";
import { useController, useFormContext } from "react-hook-form";
import { EyeIcon, EyeOffIcon } from "@/components/brand/icons";
import { FieldFrame, fieldControl } from "@/components/hook-form/field-frame";

type PasswordFieldProps = {
  name: string;
  label?: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "defaultValue" | "type">;

export function PasswordField({ name, label, hint, className, ...props }: PasswordFieldProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const [shown, setShown] = useState(false);

  return (
    <FieldFrame label={label} error={fieldState.error?.message} hint={hint}>
      <div className="relative">
        <input
          {...props}
          type={shown ? "text" : "password"}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onBlur={field.onBlur}
          onChange={field.onChange}
          className={cn(fieldControl, "pr-10", fieldState.error && "border-rose-500", className)}
        />
        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
          onClick={() => setShown((value) => !value)}
        >
          {shown ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </FieldFrame>
  );
}
