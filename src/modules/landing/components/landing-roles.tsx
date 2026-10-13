import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const roles = [
  ["Project manager", "Creates workspaces, projects, and invites."],
  ["Developer", "Personal envs, plus the workspaces they join."],
];

export function LandingRoles() {
  return (
    <section id="roles" className="scroll-mt-20 bg-ink-950 py-14 text-white sm:scroll-mt-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2">
        <LandingReveal>
          <p className="text-sm font-semibold text-brand-500">How teams use it</p>
          <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Build the vault that <span className="text-brand-500">defines what ships.</span>
          </h2>
          <p className="mt-4 max-w-md text-ink-400">Each person sees the right surface. Nothing extra. Nothing missing.</p>
        </LandingReveal>
        <div className="grid gap-3">
          {roles.map(([title, text], index) => (
            <LandingReveal key={title} delay={index * 90}>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-brand-500/40 hover:bg-white/8">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-1 text-sm text-ink-400">{text}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
