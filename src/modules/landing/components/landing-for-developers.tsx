import { LandingPreviewCard } from "@/modules/landing/components/landing-preview-card";
import { LandingReveal } from "@/modules/landing/components/landing-reveal";

export function LandingForDevelopers() {
  return (
    <section className="bg-canvas py-14 dark:bg-ink-900/40 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-center">
        <LandingReveal>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-500">For developers</p>
          <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Keep personal files. Join the rest by invite.
          </h2>
          <p className="mt-4 text-mute dark:text-ink-400">
            Your personal vault stays yours. Shared project envs appear when a project manager invites you, with the access they chose.
          </p>
        </LandingReveal>
        <LandingReveal delay={120}>
          <LandingPreviewCard
            eyebrow="My envs"
            title="Local tooling"
            rows={[
              ["Stripe sandbox", "Development"],
              ["Analytics preview", "Staging"],
            ]}
          />
        </LandingReveal>
      </div>
    </section>
  );
}
