import type { FormEvent, ReactNode } from "react";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";

export function Form<T extends FieldValues>({
  methods,
  onSubmit,
  children,
  className,
}: {
  methods: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}
