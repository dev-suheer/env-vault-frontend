export function LandingPreviewCard({
  eyebrow,
  title,
  rows,
}: {
  eyebrow: string;
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm dark:border-ink-700 dark:bg-ink-900">
      <p className="text-xs font-semibold tracking-wide text-mute uppercase dark:text-ink-400">{eyebrow}</p>
      <p className="mt-2 text-lg font-bold">{title}</p>
      <div className="mt-4 space-y-2">
        {rows.map(([name, kind]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-3 text-sm dark:border-ink-700"
          >
            <span className="min-w-0 truncate font-medium">{name}</span>
            <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-xs text-mute dark:bg-ink-800 dark:text-ink-400">
              {kind}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
