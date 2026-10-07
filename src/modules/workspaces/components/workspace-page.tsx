"use client";

import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { Crumbs } from "@/components/brand/crumbs";
import { EmptyState } from "@/components/brand/empty-state";
import { PencilIcon, PlusIcon } from "@/components/brand/icons";
import { CardGridSkeleton, Skeleton } from "@/components/brand/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useVault } from "@/lib/store";
import { danger, mute, primary } from "@/lib/styles";
import { usePageTitle } from "@/lib/title";
import { NewProjectModal } from "@/modules/projects/components/new-project-modal";
import { ProjectCard } from "@/modules/projects/components/project-card";
import { AuditLog } from "@/modules/workspaces/components/audit-log";
import { InvitePanel } from "@/modules/workspaces/components/invite-panel";
import { MemberList } from "@/modules/workspaces/components/member-list";
import { NewWorkspaceModal } from "@/modules/workspaces/components/new-workspace-modal";
import { useListProjectsQuery } from "@/store/Reducer/projects-api";
import {
  canManageWorkspace,
  useDeleteWorkspaceMutation,
  useGetWorkspaceQuery,
  type Workspace,
} from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { me } = useVault();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const search = useDebouncedValue(keyword.trim());

  const requested = searchParams.get("tab");
  const onParentTab = requested === "members" || requested === "audit";

  const {
    data: workspaceRecord,
    isError: workspaceMissing,
    error: workspaceError,
  } = useGetWorkspaceQuery(params.workspaceId, { skip: !onParentTab });

  const canManageRecord = Boolean(
    me && workspaceRecord && canManageWorkspace(me, workspaceRecord),
  );
  const showProjects = !onParentTab || (requested === "audit" && Boolean(workspaceRecord) && !canManageRecord);

  const {
    data: projects,
    isLoading: loadingProjects,
    isError: projectsMissing,
    error: projectsError,
  } = useListProjectsQuery(
    {
      workspaceId: params.workspaceId,
      page,
      limit: 12,
      keyword: search || undefined,
    },
    { skip: !showProjects },
  );

  const incoming = projects?.workspace ?? workspaceRecord;
  const [workspace, setWorkspace] = useState<Workspace | undefined>();
  if (workspace && workspace.id !== params.workspaceId) {
    setWorkspace(undefined);
  } else if (incoming && incoming.id === params.workspaceId && workspace !== incoming) {
    setWorkspace(incoming);
  }

  const canManage = Boolean(me && workspace && canManageWorkspace(me, workspace));
  const tab =
    requested === "members"
      ? "members"
      : requested === "audit"
        ? workspace
          ? canManage
            ? "audit"
            : "projects"
          : "audit"
        : "projects";

  const [removeWorkspace, { isLoading: deleting }] =
    useDeleteWorkspaceMutation();
  usePageTitle(workspace?.name);
  const missing = tab === "projects" ? projectsMissing : workspaceMissing;
  const loadError = tab === "projects" ? projectsError : workspaceError;

  useEffect(() => {
    if (!missing) return;
    showError(getErrorMessage(loadError));
    router.replace("/workspaces");
  }, [missing, loadError, router]);

  if (!me) return null;
  if (!workspace) return <WorkspaceSkeleton />;

  const projectRows = projects?.data ?? [];

  function setTab(next: "projects" | "members" | "audit") {
    const query = next === "projects" ? "" : `?tab=${next}`;
    router.replace(`/workspaces/${workspace!.id}${query}`);
  }

  async function onDelete() {
    try {
      await removeWorkspace(workspace!.id).unwrap();
      setConfirmDelete(false);
      showSuccess("Workspace deleted");
      router.push("/workspaces");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  }

  return (
    <div className="fade">
      <Crumbs
        items={[
          { href: "/workspaces", label: "Workspaces" },
          { label: workspace.name },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <h1 className="text-2xl font-extrabold break-words">
              {workspace.name}
            </h1>
            {canManage ? (
              <button
                type="button"
                aria-label="Edit workspace"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                onClick={() => setEditing(true)}
              >
                <PencilIcon />
              </button>
            ) : null}
          </div>
          <p className={`mt-1 text-sm break-words ${mute}`}>
            {workspace.desc || "No description"} · PM: {workspace.ownerName}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          {canManage ? (
            <button
              type="button"
              className={`${primary} flex-1 sm:flex-none`}
              onClick={() => setOpen(true)}
            >
              <PlusIcon />
              New project
            </button>
          ) : null}
          {canManage ? (
            <button
              type="button"
              className={`${danger} flex-1 sm:flex-none`}
              onClick={() => setConfirmDelete(true)}
            >
              Delete workspace
            </button>
          ) : null}
        </div>
      </div>

      <div className="tab-scroll mt-6 flex gap-1 border-b border-line text-sm font-semibold dark:border-ink-700">
        {(
          [
            ["projects", `Projects (${workspace.projectCount})`],
            ["members", `Members (${workspace.members.length + 1})`],
            ...(canManage ? [["audit", "Audit"] as const] : []),
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "projects" ? (
        <>
          <input
            value={keyword}
            placeholder="Search projects"
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            className="mt-6 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-ink-650 dark:bg-ink-900 sm:max-w-xs"
          />
          {loadingProjects ? (
            <CardGridSkeleton />
          ) : projectRows.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectRows.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  canManage={canManage}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={search ? "No matching projects" : "No projects yet"}
              text={
                search
                  ? "Try a different name or description."
                  : canManage
                    ? "Create a project, then add env files inside it."
                    : "The project manager adds projects. Envs live inside a project."
              }
            />
          )}
          {projects && projects.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-end gap-2 text-sm">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className={mute}>
                {page} / {projects.totalPages}
              </span>
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
                disabled={page >= projects.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : tab === "members" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <MemberList workspace={workspace} canManage={canManage} />
          <InvitePanel workspaceId={workspace.id} canManage={canManage} />
        </div>
      ) : (
        <AuditLog workspaceId={workspace.id} />
      )}

      <NewProjectModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspace.id}
        workspaceName={workspace.name}
      />

      <NewWorkspaceModal
        open={editing}
        onClose={() => setEditing(false)}
        workspace={workspace}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete workspace"
        body={`Delete "${workspace.name}" and its ${workspace.projectCount} project(s)? Deleted records stay in the database and disappear from the app.`}
        confirmLabel={deleting ? "Deleting…" : "Delete workspace"}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="fade" aria-busy="true" aria-label="Loading workspace">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 shrink-0" />
      </div>
      <div className="mt-6 flex gap-4 border-b border-line pb-3 dark:border-ink-700">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <CardGridSkeleton />
    </div>
  );
}
