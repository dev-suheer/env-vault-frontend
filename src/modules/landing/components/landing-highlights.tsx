import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const items = [
  ["Workspaces", "One home per team"],
  ["Shared access", "View or edit by invite"],
  ["Audit trail", "Who changed what, when"],
];

export function LandingHighlights() {
  return (
    <LandingReveal>
      <section className="border-y border-line bg-canvas py-8 dark:border-ink-700 dark:bg-ink-900/40 sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 text-center sm:grid-cols-3 sm:gap-6 sm:px-6">
          {items.map(([title, text]) => (
            <div key={title}>
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-1 text-sm text-mute dark:text-ink-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </LandingReveal>
  );
}
