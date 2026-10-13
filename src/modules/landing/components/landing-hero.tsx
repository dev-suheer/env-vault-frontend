import Link from "next/link";
import type { LandingCta } from "@/modules/landing/types";

export function LandingHero({ start }: { start: LandingCta }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-24 sm:pt-20">
      <p
        className="landing-hero text-center text-[10px] font-semibold tracking-[0.1em] text-brand-700 uppercase sm:text-xs sm:tracking-[0.2em] dark:text-brand-500"
        style={{ animationDelay: "0ms" }}
      >
        Shared env files, without the leak
      </p>
      <h1
        className="landing-hero mx-auto mt-3 max-w-4xl text-center text-[2rem] font-extrabold leading-[1.12] tracking-tight text-balance sm:mt-4 sm:text-6xl sm:leading-[1.05]"
        style={{ animationDelay: "80ms" }}
      >
        Modern environment management for{" "}
        <span className="text-brand-600 dark:text-brand-500">development teams.</span>
      </h1>
      <p
        className="landing-hero mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-mute sm:mt-5 sm:text-lg dark:text-ink-400"
        style={{ animationDelay: "160ms" }}
      >
        Project managers set up workspaces. Developers join by invite. Everyone works from the same env files without pasting secrets in chat.
      </p>
      <div className="landing-hero mx-auto mt-7 flex w-full max-w-sm flex-col items-stretch gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3" style={{ animationDelay: "240ms" }}>
        <Link
          href={start.href === "/signup" ? "/login" : start.href}
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 sm:w-auto"
        >
          {start.label}
        </Link>
        <a
          href="#product"
          className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold transition hover:bg-canvas sm:w-auto dark:border-ink-650 dark:hover:bg-ink-900"
        >
          See how it works
        </a>
      </div>
      <div className="landing-hero" style={{ animationDelay: "360ms" }}>
        <div className="landing-float">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-line bg-ink-950 p-3.5 shadow-xl sm:mt-14 sm:p-6">
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <span className="h-2 w-2 rounded-full bg-rose-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        <img src="/assets/logo.png" alt="" className="ml-1 h-3.5 w-3.5 object-contain" />
        <img src="/assets/logo-text-white.png" alt="SecureEnv" className="h-3 w-auto object-contain" />
      </div>
      <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-900 p-3.5 sm:p-4">
          <p className="text-xs text-ink-400">Workspace</p>
          <p className="mt-1 font-bold text-white">Payments platform</p>
          <p className="mt-2 text-xs text-ink-400 sm:mt-3">2 projects · 4 members</p>
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-ink-900 p-3.5 sm:p-4">
          <p className="text-xs text-ink-400">Frontend Prod</p>
          <p className="mt-2 truncate font-mono text-[11px] text-brand-500 sm:text-xs">DATABASE_URL=postgres://••••</p>
          <p className="mt-1 truncate font-mono text-[11px] text-ink-400 sm:text-xs">STRIPE_SECRET_KEY=sk_live_••••</p>
        </div>
      </div>
    </div>
  );
}

