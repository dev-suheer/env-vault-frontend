"use client";

import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/icons";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";

export const authField =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base sm:text-sm dark:border-ink-650 dark:bg-ink-900";

export const authInput = `mt-1 ${authField}`;

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col bg-slate-900 p-12 text-white lg:flex dark:border-r dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center gap-2 text-lg font-bold">
          <LogoMark />
          EnvVault
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">Your repo can be recloned. Your .env can&apos;t.</h1>
          <p className="mt-4 max-w-md text-slate-400">
            Project managers set up workspaces, devs join by invite, and everyone shares the same env files without pasting secrets in chat.
          </p>
          <div className="mt-8 max-w-md rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6">
            <p>
              <span className="text-[#79c0ff]">DATABASE_URL</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">postgres://••••••••</span>
            </p>
            <p>
              <span className="text-[#79c0ff]">STRIPE_SECRET_KEY</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">sk_live_••••••••</span>
            </p>
            <p>
              <span className="text-[#79c0ff]">JWT_SECRET</span>
              <span className="text-slate-500">=</span>
              <span className="text-[#a5d6ff]">••••••••••••</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-y-auto p-6">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="w-full max-w-sm py-10">
          <div className="mb-6 flex items-center gap-2 text-lg font-bold lg:hidden">
            <LogoMark />
            EnvVault
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
