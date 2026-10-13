"use client";

import { MoonIcon, SunIcon } from "@/components/brand/icons";
import { toggleTheme } from "@/modules/theme/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`grid h-9 w-9 place-items-center rounded-lg text-[#4b535d] hover:bg-[#eff2f5] dark:text-ink-200 dark:hover:bg-ink-800 ${className}`}
      aria-label="Switch theme"
      title="Switch theme"
      onClick={toggleTheme}
    >
      <MoonIcon className="h-5 w-5 dark:hidden" />
      <SunIcon className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
