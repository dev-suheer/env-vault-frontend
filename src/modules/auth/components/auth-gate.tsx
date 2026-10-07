"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { homePath } from "@/lib/permissions";
import { useVault } from "@/lib/store";

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, me } = useVault();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !me) return;
    router.replace(homePath(me.role));
  }, [ready, me, router]);

  if (!ready || me) return <div className="min-h-dvh" />;
  return children;
}
