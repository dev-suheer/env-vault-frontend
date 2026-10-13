import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const items = [
  ["Signed sessions", "Signed-in requests carry a hashed session token. An expired session ends access."],
  ["Access checks", "Every workspace, project, and env checks who you are before it returns."],
  ["Soft delete", "Deletes hide records from the app. They are not wiped from the database."],
  ["No values in audit", "The log stores the action, not the secret. Variable values never land there."],
];

export function LandingSecurity() {
  return (
    <section id="security" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:scroll-mt-24 sm:px-6 sm:py-28">
      <LandingReveal>
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-500">Security</p>
          <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Built so secrets stay in the vault.
          </h2>
        </div>
      </LandingReveal>
      <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
        {items.map(([title, text], index) => (
          <LandingReveal key={title} delay={index * 70}>
            <article className="h-full rounded-2xl border border-line bg-white p-5 transition hover:border-brand-500/30 sm:p-6 dark:border-ink-700 dark:bg-ink-900">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-mute dark:text-ink-400">{text}</p>
            </article>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
