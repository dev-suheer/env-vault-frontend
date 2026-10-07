"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPhoto } from "@/components/brand/avatar";
import { LogoMark, SignOutIcon, UserIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { homePath } from "@/lib/permissions";
import { mute } from "@/lib/styles";
import { useDispatch } from "react-redux";
import { useVault } from "@/lib/store";
import { useLogoutMutation } from "@/store/Reducer/auth-api";
import { logout as clearSession } from "@/store/slice/userSlice";
import { resetStore } from "@/store/store";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { Subnav } from "@/modules/shell/components/subnav";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";

export function AppHeader() {
  const { me, logout } = useVault();
  const dispatch = useDispatch();
  const [signOut] = useLogoutMutation();
  const router = useRouter();
  const [menu, setMenu] = useState<"profile" | "bell" | null>(null);
  const profileOpen = menu === "profile";
  const setBell = useCallback((next: boolean) => setMenu(next ? "bell" : null), []);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  if (!me) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur dark:border-ink-700 dark:bg-ink-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 font-bold"
          onClick={() => router.push(homePath(me.role))}
        >
          <LogoMark className="h-7 w-7 shrink-0" iconClassName="h-3.5 w-3.5" strokeWidth={2.4} />
          <span className="truncate">EnvVault</span>
        </button>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          {me.role === "admin" ? null : (
            <NotificationBell open={menu === "bell"} onOpenChange={setBell} />
          )}
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={profileOpen}
              title="Account"
              className="rounded-full ring-2 ring-transparent transition hover:ring-brand-500/40"
              onClick={() => setMenu((value) => (value === "profile" ? null : "profile"))}
            >
              <UserPhoto name={me.name} image={me.image} className="h-9 w-9 text-sm" />
            </button>
            {profileOpen ? (
              <div className="fade surface absolute right-0 top-11 z-30 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white p-2 dark:border-ink-700 dark:bg-ink-900">
                <div className="flex items-center gap-3 p-2">
                  <UserPhoto name={me.name} image={me.image} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{me.name}</p>
                    <p className={`truncate text-xs ${mute}`}>{me.email}</p>
                  </div>
                </div>
                <div className="mx-2 mb-2">
                  <RoleChip role={me.role} />
                </div>
                <div className="my-1 border-t border-[#eaeef2] dark:border-ink-700" />
                <Link
                  href="/profile"
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800"
                  onClick={() => setMenu(null)}
                >
                  <UserIcon />
                  Profile
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  onClick={async () => {
                    setMenu(null);
                    try {
                      await signOut().unwrap();
                    } catch {
                      /* the local session still ends if the server token is already gone */
                    }
                    dispatch(clearSession());
                    dispatch(resetStore());
                    logout();
                    router.replace("/");
                  }}
                >
                  <SignOutIcon />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Subnav />
    </header>
  );
}
