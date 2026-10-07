"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/brand/icons";
import { CardGridSkeleton } from "@/components/brand/skeleton";
import { EmptyState } from "@/components/brand/empty-state";
import { plural } from "@/lib/format";
import { input, mute, primary } from "@/lib/styles";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useVault } from "@/lib/store";
import { EnvGrid } from "@/modules/envs/components/env-card";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";
import { useListPersonalEnvsQuery } from "@/store/Reducer/envs-api";
import { getErrorMessage } from "@/utils/api";

export function PersonalEnvs() {
  const { me } = useVault();
  const [keyword, setKeyword] = useState("");
  const search = useDebouncedValue(keyword.trim());
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useListPersonalEnvsQuery(
    { page, limit: 20, keyword: search || undefined },
    { skip: !me },
  );
  if (!me) return null;

  const list = data?.data ?? [];
  const total = list.reduce((count, env) => count + env.vars.length, 0);

  return (
    <div className="fade">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">My envs</h1>
          <p className={`mt-1 text-sm ${mute}`}>
            Private to you. {plural(data?.totalRecords ?? 0, "env")}
            {list.length ? ` · ${plural(total, "variable")} on this page` : ""}
          </p>
        </div>
        <button type="button" className={`${primary} w-full sm:w-auto`} onClick={() => setOpen(true)}>
          <PlusIcon />
          New env
        </button>
      </div>
      {isLoading ? <CardGridSkeleton /> : null}
      {isError ? <p className="mt-6 text-sm text-rose-600 dark:text-rose-400">{getErrorMessage(error)}</p> : null}
      {!isLoading && !isError && (list.length || search) ? (
        <>
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Search envs"
            className={`mt-6 sm:max-w-xs ${input}`}
          />
          <div className="mt-4">
            <EnvGrid list={list} showOwner={false} />
          </div>
        </>
      ) : null}
      {!isLoading && !isError && !list.length && !search ? (
        <EmptyState
          title="No personal envs yet"
          text="Keep your own .env files here. Nobody else can see them."
          action={
            <button type="button" className={`${primary} mt-5`} onClick={() => setOpen(true)}>
              Create your first env
            </button>
          }
        />
      ) : null}
      {data && data.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-end gap-2 text-sm">
          <button type="button" className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className={mute}>
            {page} / {data.totalPages}
          </span>
          <button type="button" className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      ) : null}
      <NewEnvModal open={open} onClose={() => setOpen(false)} projectId={null} />
    </div>
  );
}
