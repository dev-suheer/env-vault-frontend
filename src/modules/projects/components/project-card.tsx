"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon } from "@/components/brand/icons";
import { ago } from "@/lib/format";
import { mute } from "@/lib/styles";
import { NewProjectModal } from "@/modules/projects/components/new-project-modal";
import type { Project } from "@/store/Reducer/projects-api";

export function ProjectCard({ project, canManage }: { project: Project; canManage: boolean }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Link
        href={`/workspaces/${project.workspaceId}/projects/${project.id}`}
        className="surface rounded-xl border border-line bg-white p-5 text-left transition-colors hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/70"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold">{project.name}</h3>
          {canManage ? (
            <button
              type="button"
              aria-label="Edit project"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#8c959f] hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-500"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setEditing(true);
              }}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className={`mt-1 line-clamp-2 min-h-10 text-sm ${mute}`}>{project.desc || "No description"}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#8c959f] dark:text-ink-400">
          <span className="truncate">{project.ownerName}</span>
          <span className="shrink-0">{ago(project.created)}</span>
        </div>
      </Link>
      {canManage ? (
        <NewProjectModal
          open={editing}
          onClose={() => setEditing(false)}
          workspaceId={project.workspaceId}
          project={project}
        />
      ) : null}
    </>
  );
}
