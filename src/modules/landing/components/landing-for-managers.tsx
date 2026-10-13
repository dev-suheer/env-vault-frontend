import Link from "next/link";
import { LandingPreviewCard } from "@/modules/landing/components/landing-preview-card";
import { LandingReveal } from "@/modules/landing/components/landing-reveal";
import type { LandingCta } from "@/modules/landing/types";

export function LandingForManagers({ start }: { start: LandingCta }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
      <LandingReveal>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-500">For project managers</p>
        <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
          Set up the workspace. Invite the team.
        </h2>
        <p className="mt-4 text-mute dark:text-ink-400">
          Create a workspace, add projects, and drop env files where they belong. Give a developer view or edit, then the audit log shows what changed.
        </p>
        <Link href={start.href} className="mt-6 inline-flex text-sm font-semibold text-brand-700 transition hover:gap-2 dark:text-brand-500">
          {start.label} →
        </Link>
      </LandingReveal>
      <LandingReveal delay={120}>
        <LandingPreviewCard
          eyebrow="Workspace"
          title="Payments platform"
          rows={[
            ["Frontend Prod", "Production"],
            ["Frontend Dev", "Development"],
          ]}
        />
      </LandingReveal>
    </section>
  );
}
