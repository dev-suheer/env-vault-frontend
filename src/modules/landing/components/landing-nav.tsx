"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon, MenuIcon } from "@/components/brand/icons";
import { BrandLogo } from "@/components/brand/logo";
import { homePath } from "@/lib/permissions";
import { useVault } from "@/lib/store";
import { ThemeToggle } from "@/modules/theme/components/theme-toggle";

const links = [
  { href: "#product", label: "Product" },
  { href: "#roles", label: "Roles" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const { me } = useVault();
  const [open, setOpen] = useState(false);
  const startHref = me ? homePath(me.role) : "/signup";
  const startLabel = me ? "Open app" : "Get started";

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white pt-2 dark:bg-ink-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="min-w-0">
            <BrandLogo markClassName="h-7 w-7 sm:h-8 sm:w-8" wordmarkClassName="h-[18px] sm:h-5" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <Link
              href={startHref}
              className="hidden whitespace-nowrap rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 md:inline-flex"
            >
              {startLabel}
            </Link>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line md:hidden dark:border-ink-650"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <div className="md:hidden" aria-hidden={!open}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`fixed top-0 left-0 z-40 flex h-dvh w-[min(19rem,82vw)] flex-col bg-white pt-16 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:bg-ink-950 sm:pt-[4.5rem] ${open ? "translate-x-0" : "pointer-events-none -translate-x-full"}`}
        >
          <nav className="flex-1 space-y-1 px-3 pt-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-canvas dark:hover:bg-ink-900"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <p className="text-sm font-semibold">Theme</p>
              <ThemeToggle />
            </div>
          </nav>
          <div className="px-5 py-5">
            <Link
              href={startHref}
              tabIndex={open ? 0 : -1}
              className="flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              onClick={() => setOpen(false)}
            >
              {startLabel}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
