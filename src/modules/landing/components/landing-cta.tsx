import Link from "next/link";
import { LandingReveal } from "@/modules/landing/components/landing-reveal";
import type { LandingCta } from "@/modules/landing/types";

export function LandingCta({ start, signedIn }: { start: LandingCta; signedIn: boolean }) {
  return (
    <section className="bg-ink-950 px-4 py-14 text-center text-white sm:px-6 sm:py-28">
      <LandingReveal>
        <h2 className="mx-auto max-w-3xl text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
          Ready to stop pasting secrets in chat?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink-400">
          Create an account, open a workspace, and keep the team on the same env files.
        </p>
        <div className="mx-auto mt-7 flex w-full max-w-sm flex-col items-stretch gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <Link
            href={start.href}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto"
          >
            {start.label}
          </Link>
          {signedIn ? null : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/5 sm:w-auto"
            >
              Sign in
            </Link>
          )}
        </div>
      </LandingReveal>
    </section>
  );
}
