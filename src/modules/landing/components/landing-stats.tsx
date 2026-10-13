import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const stats = [
  ["Workspaces", "Team-scoped"],
  ["Env kinds", "Prod · Staging · Dev"],
  ["Access", "View or edit"],
];

export function LandingStats() {
  return (
    <LandingReveal>
      <section className="bg-brand-50 py-8 dark:bg-brand-500/10 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3 sm:gap-8 sm:px-6">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-extrabold text-brand-700 sm:text-2xl dark:text-brand-500">{value}</p>
              <p className="mt-1 text-sm text-mute dark:text-ink-400">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </LandingReveal>
  );
}
