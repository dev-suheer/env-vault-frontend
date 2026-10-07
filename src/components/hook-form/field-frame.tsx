import type { ReactNode } from "react";
import { cn } from "cn";
import { mute } from "@/lib/styles";

export const fieldControl =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-fg outline-none placeholder:text-[#6e7681] sm:text-sm dark:border-ink-650 dark:bg-[#0d1117] dark:text-ink-100";

export function FieldFrame({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
      {!error && hint ? <div className={cn("mt-1.5 text-xs", mute)}>{hint}</div> : null}
    </div>
  );
}
