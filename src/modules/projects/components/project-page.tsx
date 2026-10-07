"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { PencilIcon, PlusIcon } from "@/components/brand/icons";
import { EmptyState } from "@/components/brand/empty-state";
import { CardGridSkeleton, Skeleton } from "@/components/brand/skeleton";
import { canCreateIn } from "@/lib/permissions";
import { usePageTitle } from "@/lib/title";
import { danger, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { EnvCard } from "@/modules/envs/components/env-card";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";
import { NewProjectModal } from "@/modules/projects/components/new-project-modal";
import { canEditEnv, useListProjectEnvsQuery } from "@/store/Reducer/envs-api";
import { useDeleteProjectMutation } from "@/store/Reducer/projects-api";
import { asVaultWorkspace, canManageWorkspace } from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

export function ProjectPage() {
  const params = useParams<{ workspaceId: string; projectId: string }>();
  const router = useRouter();
  const { me } = useVault();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removeProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const { data: envPage, isLoading, isError, error } = useListProjectEnvsQuery(
    { projectId: params.projectId, page: 1, limit: 50 },
    { skip: !params.projectId },
  );
  const workspace = envPage?.workspace;
  const project = envPage?.project;
  usePageTitle(project?.name);

  useEffect(() => {
    if (!isError) return;
    showError(getErrorMessage(error));
    router.replace(params.workspaceId ? `/workspaces/${params.workspaceId}` : "/workspaces");
  }, [isError, error, router, params.workspaceId]);

  if (!me) return null;
  if (isLoading || !workspace || !project) return <ProjectSkeleton />;

  const envs = envPage?.data ?? [];
  const canManage = canManageWorkspace(me, workspace);
  const vaultWorkspace = asVaultWorkspace(workspace);

  async function onDelete() {
    try {
      await removeProject({ id: project!.id, workspaceId: workspace!.id }).unwrap();
      setConfirmDelete(false);
      showSuccess("Project deleted");
      router.push(`/workspaces/${workspace!.id}`);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }

  return (
    <div className="fade">
      <Crumbs
        items={[
          { href: "/workspaces", label: "Workspaces" },
          { href: `/workspaces/${workspace.id}`, label: workspace.name },
          { label: project.name },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <h1 className="text-2xl font-extrabold break-words">{project.name}</h1>
            {canManage ? (
              <button
                type="button"
                aria-label="Edit project"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                onClick={() => setEditing(true)}
              >
                <PencilIcon />
              </button>
            ) : null}
          </div>
          <p className={`mt-1 text-sm break-words ${mute}`}>{project.desc || "No description"}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          {canCreateIn(me, vaultWorkspace) ? (
            <button type="button" className={`${primary} flex-1 sm:flex-none`} onClick={() => setOpen(true)}>
              <PlusIcon />
              New env
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className={`${danger} flex-1 sm:flex-none`} onClick={() => setConfirmDelete(true)}>
              Delete project
            </button>
          ) : null}
        </div>
      </div>
      {envs.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {envs.map((env) => (
            <EnvCard key={env.id} env={env} showOwner canEdit={canEditEnv(me, env, workspace)} />
          ))}
        </div>
      ) : (
        <EmptyState title="No envs in this project yet" text={canCreateIn(me, vaultWorkspace) ? "Add the first env for this project." : "Nothing here yet."} />
      )}
      <NewEnvModal open={open} onClose={() => setOpen(false)} projectId={project.id} />
      <NewProjectModal open={editing} onClose={() => setEditing(false)} workspaceId={workspace.id} workspaceName={workspace.name} project={project} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete project"
        body={`Delete "${project.name}"? The project and its env files stay in the database and disappear from the app.`}
        confirmLabel={deleting ? "Deleting…" : "Delete project"}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="fade" aria-busy="true" aria-label="Loading project">
      <Skeleton className="h-4 w-56" />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="mt-3 h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28 shrink-0" />
      </div>
      <CardGridSkeleton />
    </div>
  );
}
