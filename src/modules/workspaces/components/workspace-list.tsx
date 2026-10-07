"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/brand/icons";
import { CardGridSkeleton } from "@/components/brand/skeleton";
import { EmptyState } from "@/components/brand/empty-state";
import { plural } from "@/lib/format";
import { mute, primary } from "@/lib/styles";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useVault } from "@/lib/store";
import { NewWorkspaceModal } from "@/modules/workspaces/components/new-workspace-modal";
import { WorkspaceCard } from "@/modules/workspaces/components/workspace-card";
import { useListNotificationsQuery } from "@/store/Reducer/invites-api";
import { useListWorkspacesQuery } from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";

export function WorkspaceList() {
  const { me } = useVault();
  const { data: notes } = useListNotificationsQuery({ page: 1, limit: 50 }, { skip: me?.role !== "dev" });
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const search = useDebouncedValue(keyword.trim());
  const { data, isLoading, isError, error } = useListWorkspacesQuery({ page, limit: 12, keyword: search || undefined });
  if (!me) return null;

  const list = data?.data ?? [];
  const pendingCount =
    me.role === "dev" ? (notes?.data ?? []).filter((note) => note.kind === "invite" && note.status === "pending").length : 0;

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Workspaces</h1>
          <p className={`mt-1 text-sm ${mute}`}>
            {plural(data?.totalRecords ?? 0, "workspace")}
            {me.role === "admin" ? " across the organization" : ""}
          </p>
        </div>
        {me.role === "pm" ? (
          <button type="button" className={`${primary} w-full sm:w-auto`} onClick={() => setOpen(true)}>
            <PlusIcon />
            New workspace
          </button>
        ) : null}
      </div>
      <input
        value={keyword}
        placeholder="Search workspaces"
        onChange={(event) => {
          setKeyword(event.target.value);
          setPage(1);
        }}
        className="mt-4 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-ink-650 dark:bg-ink-900 sm:max-w-xs"
      />
      {isLoading ? <CardGridSkeleton /> : null}
      {isError ? <p className="mt-6 text-sm text-rose-600 dark:text-rose-400">{getErrorMessage(error)}</p> : null}
      {!isLoading && !isError && list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !list.length && !search ? (
        me.role === "pm" ? (
          <EmptyState
            title="No workspaces yet"
            text="Create a workspace, add a project, then keep env files inside that project."
            action={
              <button type="button" className={`${primary} mt-5`} onClick={() => setOpen(true)}>
                Create your first workspace
              </button>
            }
          />
        ) : me.role === "dev" ? (
          <EmptyState
            title="You have not joined a workspace yet"
            text={
              pendingCount
                ? `You have ${pendingCount} pending invite${pendingCount > 1 ? "s" : ""}. Open the bell icon to accept.`
                : "When a project manager invites you, the invite shows up under the bell icon."
            }
          />
        ) : (
          <EmptyState title="No workspaces yet" text="Workspaces created by project managers will appear here." />
        )
      ) : null}
      {!isLoading && !isError && !list.length && search ? (
        <EmptyState title="No matching workspaces" text="Try a different name or description." />
      ) : null}
      <Pager page={data?.currentPage ?? 1} totalPages={data?.totalPages ?? 0} onPage={setPage} />
      <NewWorkspaceModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-end gap-2 text-sm">
      <button type="button" className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className={mute}>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
