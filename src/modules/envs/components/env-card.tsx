"use client";

import { useState } from "react";
import Link from "next/link";
import { LockIcon, PencilIcon } from "@/components/brand/icons";
import { EnvChip } from "@/components/brand/env-chip";
import { ago, plural } from "@/lib/format";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";
import { canEditEnv, type EnvFile } from "@/store/Reducer/envs-api";

export function EnvCard({ env, showOwner, canEdit }: { env: EnvFile; showOwner: boolean; canEdit?: boolean }) {
  const { me } = useVault();
  const [editing, setEditing] = useState(false);
  if (!me) return null;
  const readOnly = !(canEdit ?? canEditEnv(me, env, null));
  return (
    <>
      <Link
        href={`/envs/${env.id}`}
        className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold">{env.name}</h3>
          <span className="flex shrink-0 items-center gap-2">
            {readOnly ? null : (
              <button
                type="button"
                aria-label="Edit env"
                className="grid h-7 w-7 place-items-center rounded-md text-[#8c959f] hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-500"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setEditing(true);
                }}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            )}
            <EnvChip env={env.env} />
          </span>
        </div>
        <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{env.desc || "No description"}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
          <span className="truncate">
            {plural(env.vars.length, "variable")} · Updated {ago(env.updated)}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {showOwner ? <span className="max-w-24 truncate sm:max-w-none">by {env.ownerName}</span> : null}
            {readOnly ? (
              <span className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 dark:border-ink-700">
                <LockIcon className="h-3 w-3" strokeWidth={2} />
                View only
              </span>
            ) : null}
          </span>
        </div>
      </Link>
      {readOnly ? null : <NewEnvModal open={editing} onClose={() => setEditing(false)} projectId={env.projectId} existing={env} />}
    </>
  );
}

export function EnvGrid({ list, showOwner }: { list: EnvFile[]; showOwner: boolean }) {
  if (!list.length) return <p className={`text-sm ${mute}`}>No envs match your search.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((env) => (
        <EnvCard key={env.id} env={env} showOwner={showOwner} />
      ))}
    </div>
  );
}
