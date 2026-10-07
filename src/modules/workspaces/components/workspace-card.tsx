"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { plural } from "@/lib/format";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { NewWorkspaceModal } from "@/modules/workspaces/components/new-workspace-modal";
import { canManageWorkspace, type Workspace } from "@/store/Reducer/workspaces-api";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const { me } = useVault();
  const [editing, setEditing] = useState(false);
  if (!me) return null;
  const mine = workspace.ownerEmail === me.email;
  const canManage = canManageWorkspace(me, workspace);

  return (
    <>
      <Link
        href={`/workspaces/${workspace.id}`}
        className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold">{workspace.name}</h3>
          <span className="flex shrink-0 items-center gap-2">
            {canManage ? (
              <button
                type="button"
                aria-label="Edit workspace"
                className="grid h-7 w-7 place-items-center rounded-md text-[#8c959f] hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-500"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setEditing(true);
                }}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {me.role === "admin" ? null : <RoleChip role={mine ? "pm" : "dev"} label={mine ? "Owner" : "Member"} />}
          </span>
        </div>
        <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{workspace.desc || "No description"}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
          <span className="truncate">PM: {workspace.ownerName}</span>
          <span className="shrink-0">
            {plural(workspace.projectCount, "project")} · {plural(workspace.members.length, "dev")}
          </span>
        </div>
      </Link>
      {canManage ? <NewWorkspaceModal open={editing} onClose={() => setEditing(false)} workspace={workspace} /> : null}
    </>
  );
}
