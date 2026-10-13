"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useVault } from "@/lib/store";
import { AppHeader } from "@/modules/shell/components/app-header";
import { MainTransition } from "@/modules/shell/components/main-transition";

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, me, logout } = useVault();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!me || me.active === false) {
      if (me?.active === false) logout();
      router.replace("/login");
      return;
    }
    if (pathname === "/envs" && me.role !== "dev") router.replace("/workspaces");
    if ((pathname.startsWith("/users") || pathname.startsWith("/dashboard")) && me.role !== "admin") router.replace("/workspaces");
  }, [ready, me, pathname, router, logout]);

  if (!ready || !me || me.active === false) return <div className="min-h-dvh" />;
  if (pathname === "/envs" && me.role !== "dev") return <div className="min-h-dvh" />;
  if ((pathname.startsWith("/users") || pathname.startsWith("/dashboard")) && me.role !== "admin") return <div className="min-h-dvh" />;

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6">
        <MainTransition>{children}</MainTransition>
      </main>
    </div>
  );
}
