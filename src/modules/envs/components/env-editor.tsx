"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { EyeIcon, PencilIcon } from "@/components/brand/icons";
import { EnvChip } from "@/components/brand/env-chip";
import { Skeleton } from "@/components/brand/skeleton";
import { homePath } from "@/lib/permissions";
import { usePageTitle } from "@/lib/title";
import { btn, card, danger, input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { copyText, downloadEnv, parseEnv, toEnv } from "@/modules/envs/lib/env-file";
import { ImportPanel } from "@/modules/envs/components/import-panel";
import { NewEnvModal } from "@/modules/envs/components/new-env-modal";
import { VariableRow } from "@/modules/envs/components/variable-row";
import {
  canEditEnv,
  useDeleteEnvMutation,
  useGetEnvQuery,
  useImportVariablesMutation,
  useRemoveVariableMutation,
  useUpsertVariableMutation,
} from "@/store/Reducer/envs-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

export function EnvEditor() {
  const params = useParams<{ envId: string }>();
  const router = useRouter();
  const { me } = useVault();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: env, isLoading, isError, error } = useGetEnvQuery(params.envId);
  const workspace = env?.workspace ?? null;
  const project = env?.project ?? null;
  const [leaving, setLeaving] = useState(false);
  const [upsertVariable] = useUpsertVariableMutation();
  const [removeVariable] = useRemoveVariableMutation();
  const [importVariables] = useImportVariablesMutation();
  const [deleteEnv, { isLoading: deleting }] = useDeleteEnvMutation();
  usePageTitle(env?.name);

  useEffect(() => {
    if (!isError || !me || leaving) return;
    showError(getErrorMessage(error));
    router.replace(homePath(me.role));
  }, [isError, error, me, router, leaving]);

  if (!me) return null;
  if (isLoading || !env) return <EnvSkeleton />;

  const edit = canEditEnv(me, env, workspace);
  const parentHref = project && workspace ? `/workspaces/${workspace.id}/projects/${project.id}` : "/envs";

  async function copy(text: string, message: string) {
    try {
      await copyText(text);
      showSuccess(message);
    } catch {
      showError("Copy failed. Allow clipboard access.");
    }
  }

  async function onDelete() {
    setLeaving(true);
    try {
      await deleteEnv({ id: env!.id, projectId: env!.projectId }).unwrap();
      setConfirmDelete(false);
      showSuccess("Env deleted");
      router.replace(parentHref);
    } catch (err) {
      setLeaving(false);
      showError(getErrorMessage(err));
    }
  }

  return (
    <div className="fade">
      <Crumbs
        items={
          project && workspace
            ? [
                { href: "/workspaces", label: "Workspaces" },
                { href: `/workspaces/${workspace.id}`, label: workspace.name },
                { href: `/workspaces/${workspace.id}/projects/${project.id}`, label: project.name },
                { label: env.name },
              ]
            : [
                { href: "/envs", label: "My envs" },
                { label: env.name },
              ]
        }
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-1">
            <h1 className="text-2xl font-extrabold break-words">{env.name}</h1>
            {edit ? (
              <button
                type="button"
                aria-label="Edit env"
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                onClick={() => setEditing(true)}
              >
                <PencilIcon />
              </button>
            ) : null}
          </div>
          <div className={`mt-2 flex flex-wrap items-center gap-2 text-sm ${mute}`}>
            <EnvChip env={env.env} />
            {env.desc ? <span className="break-words">{env.desc}</span> : null}
            <span>· by {env.ownerName}</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 text-sm font-medium sm:w-auto">
          <button type="button" className={`${btn} flex-1 sm:flex-none`} onClick={() => (env.vars.length ? copy(toEnv(env.vars), ".env copied") : showError("Nothing to copy yet"))}>
            Copy as .env
          </button>
          <button
            type="button"
            className={`${btn} flex-1 sm:flex-none`}
            onClick={() => downloadEnv(toEnv(env.vars))}
          >
            Download .env
          </button>
          {edit ? (
            <button type="button" className={`${danger} flex-1 sm:flex-none`} onClick={() => setConfirmDelete(true)}>
              Delete env
            </button>
          ) : null}
        </div>
      </div>

      {edit ? null : (
        <div className={`mt-5 flex items-start gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-sm ${mute} dark:border-ink-700 dark:bg-ink-900`}>
          <EyeIcon />
          <span>
            <b className="font-semibold text-fg dark:text-ink-100">View only</b>
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className={`${card} flex h-full flex-col ${edit ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 dark:border-ink-700">
            <h2 className="text-sm font-bold">Variables ({env.vars.length})</h2>
            <button
              type="button"
              className="text-sm font-semibold text-brand-700 dark:text-brand-500"
              onClick={() => {
                if (revealed.size) setRevealed(new Set());
                else setRevealed(new Set(env.vars.map((item) => item.k)));
              }}
            >
              {revealed.size ? "Hide all" : "Reveal all"}
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {env.vars.length ? (
              env.vars.map((item) => (
                <VariableRow
                  key={item.k}
                  name={item.k}
                  value={item.v}
                  shown={revealed.has(item.k)}
                  edit={edit}
                  onToggle={() => {
                    setRevealed((current) => {
                      const next = new Set(current);
                      if (next.has(item.k)) next.delete(item.k);
                      else next.add(item.k);
                      return next;
                    });
                  }}
                  onCopy={() => copy(item.v, "Value copied")}
                  onRemove={async () => {
                    try {
                      await removeVariable({ id: env.id, key: item.k }).unwrap();
                      setRevealed((current) => {
                        const next = new Set(current);
                        next.delete(item.k);
                        return next;
                      });
                      showSuccess("Variable removed");
                    } catch (err) {
                      showError(getErrorMessage(err));
                    }
                  }}
                />
              ))
            ) : (
              <p className={`px-5 py-10 text-center text-sm ${mute}`}>No variables yet.</p>
            )}
          </div>
          {edit ? (
            <form
              className="mt-auto flex flex-col gap-2 rounded-b-xl border-t border-line bg-canvas p-4 sm:flex-row sm:items-center dark:border-ink-700 dark:bg-ink-950/60"
              onSubmit={async (event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const key = String(data.get("key") ?? "").trim();
                const value = String(data.get("value") ?? "");
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
                  showError("Use letters, numbers, and underscores for the key.");
                  return;
                }
                try {
                  await upsertVariable({ id: env.id, k: key, v: value }).unwrap();
                  event.currentTarget.reset();
                  showSuccess("Variable saved");
                } catch (err) {
                  showError(getErrorMessage(err));
                }
              }}
            >
              <input
                name="key"
                required
                placeholder="KEY"
                pattern="[A-Za-z_][A-Za-z0-9_]*"
                title="Letters, numbers and underscores only"
                className={`font-mono sm:min-w-0 sm:flex-1 sm:basis-32 ${input}`}
              />
              <input name="value" placeholder="value" className={`font-mono sm:min-w-0 sm:flex-[2] sm:basis-40 ${input}`} />
              <button className="btn-p rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:py-2">Add</button>
            </form>
          ) : null}
        </div>
        {edit ? (
          <ImportPanel
            onImport={async (text) => {
              const pairs = parseEnv(text);
              if (!pairs.length) {
                showError("No KEY=value lines found");
                return false;
              }
              try {
                await importVariables({ id: env.id, pairs }).unwrap();
                showSuccess(`${pairs.length} variable${pairs.length > 1 ? "s" : ""} imported`);
                return true;
              } catch (err) {
                showError(getErrorMessage(err));
                return false;
              }
            }}
          />
        ) : null}
      </div>
      {edit ? <NewEnvModal open={editing} onClose={() => setEditing(false)} projectId={env.projectId} existing={env} /> : null}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete env"
        body={`Delete "${env.name}" and all its variables? The record stays in the database and disappears from the app.`}
        confirmLabel={deleting ? "Deleting…" : "Delete env"}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </div>
  );
}

function EnvSkeleton() {
  return (
    <div className="fade" aria-busy="true" aria-label="Loading env">
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="mt-3 h-4 w-56 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className={`${card} mt-6 overflow-hidden`}>
        <div className="border-b border-line px-5 py-4 dark:border-ink-700">
          <Skeleton className="h-4 w-28" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0 dark:border-ink-700">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
