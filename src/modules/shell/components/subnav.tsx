"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useVault } from "@/lib/store";
import { tabsFor } from "@/lib/permissions";
import { envsApi } from "@/store/Reducer/envs-api";
import type { RootState } from "@/store/store";

export function Subnav() {
  const { me } = useVault();
  const pathname = usePathname();
  const envId = pathname.startsWith("/envs/") ? pathname.split("/")[2] : "";
  const env = useSelector((state: RootState) => (envId ? envsApi.endpoints.getEnv.select(envId)(state).data : undefined));
  if (!me) return null;

  let active = pathname.startsWith("/profile") ? "" : "workspaces";
  if (pathname.startsWith("/dashboard")) active = "dashboard";
  else if (pathname.startsWith("/users")) active = "users";
  else if (pathname === "/envs") active = "personal";
  else if (envId) active = env?.workspaceId ? "workspaces" : "personal";

  return (
    <nav className="tab-scroll mx-auto flex max-w-6xl gap-1 px-4 text-sm font-semibold sm:px-6">
      {tabsFor(me.role).map((tab) => {
        const on = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 ${on ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
