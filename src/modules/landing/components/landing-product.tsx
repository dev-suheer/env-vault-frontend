import { AuditIcon, KeyIcon, LayersIcon, ShieldIcon, VaultIcon, WorkspaceIcon } from "@/modules/landing/components/landing-icons";
import { LandingReveal } from "@/modules/landing/components/landing-reveal";

const features = [
  {
    n: "01",
    title: "Workspaces",
    text: "Give each team a home. Projects, members, and env files sit together so access stays obvious.",
    icon: WorkspaceIcon,
  },
  {
    n: "02",
    title: "Projects & envs",
    text: "Keep Production, Staging, and Development next to the work they belong to, not in a shared spreadsheet.",
    icon: LayersIcon,
  },
  {
    n: "03",
    title: "Personal vault",
    text: "Developers keep private env files that nobody else can see, then join shared workspaces by invite.",
    icon: VaultIcon,
  },
  {
    n: "04",
    title: "Variables, not chat",
    text: "Add, reveal, copy, import, and download KEY=value pairs without pasting secrets into Slack or email.",
    icon: KeyIcon,
  },
  {
    n: "05",
    title: "Audit log",
    text: "See who created, updated, or deleted a workspace, project, or env. Variable values are never stored there.",
    icon: AuditIcon,
  },
  {
    n: "06",
    title: "Access that matches the work",
    text: "Project managers run workspaces and invites. Developers get view or edit on the files they need.",
    icon: ShieldIcon,
  },
];

export function LandingProduct() {
  return (
    <section id="product" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:scroll-mt-24 sm:px-6 sm:py-28">
      <LandingReveal>
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-500">Product</p>
          <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Everything you need for shared env files.
          </h2>
          <p className="mt-4 text-mute dark:text-ink-400">
            From the first workspace to the last variable, SecureEnv keeps secrets in one place the team can actually use.
          </p>
        </div>
      </LandingReveal>
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {features.map((feature, index) => (
          <LandingReveal key={feature.title} delay={index * 70}>
            <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-white to-canvas p-5 shadow-[0_1px_0_rgba(31,35,40,0.04),0_8px_24px_rgba(31,35,40,0.04)] transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-[0_16px_40px_rgba(15,157,117,0.12)] sm:p-6 dark:border-ink-700 dark:from-ink-900 dark:to-ink-950 dark:shadow-none dark:hover:border-brand-500/40">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 dark:bg-brand-500/10 dark:text-brand-500 dark:ring-brand-500/20 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                  <feature.icon />
                </div>
                <span className="font-mono text-[11px] tracking-wider text-mute dark:text-ink-400">{feature.n}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mute dark:text-ink-400">{feature.text}</p>
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-brand-500/5 transition duration-300 group-hover:bg-brand-500/12" />
            </article>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
