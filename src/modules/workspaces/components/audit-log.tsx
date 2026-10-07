"use client";

import { useState } from "react";
import { ago } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useListAuditQuery } from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";

const columns = ["When", "Who", "Action", "What", "Change"] as const;

export function AuditLog({ workspaceId }: { workspaceId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useListAuditQuery({ workspaceId, page, limit: 20 });
  const entries = data?.data ?? [];

  return (
    <div className={`${card} mt-6 overflow-hidden`}>
      <div className="border-b border-line px-5 py-4 dark:border-ink-700">
        <h2 className="text-sm font-bold">Audit log</h2>
        <p className={`mt-1 text-xs ${mute}`}>Who changed this workspace, what changed, and when. Variable values are not stored here.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas text-xs font-semibold tracking-wide text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className={`px-5 py-8 ${mute}`}>
                  Loading audit log…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-rose-600 dark:text-rose-400">
                  {getErrorMessage(error)}
                </td>
              </tr>
            ) : entries.length ? (
              entries.map((entry) => {
                const when = new Date(entry.at);
                const stamp = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(when);
                return (
                  <tr key={entry.id} className="border-b border-[#eaeef2] align-top last:border-0 hover:bg-[#f6f8fa] dark:border-ink-700 dark:hover:bg-ink-800/50">
                    <td className="px-4 py-3 pl-5 whitespace-nowrap">
                      <time dateTime={when.toISOString()} className="block">
                        {stamp}
                      </time>
                      <span className={`mt-0.5 block text-xs ${mute}`}>{ago(entry.at)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="block font-medium">{entry.actorName}</span>
                      <span className={`mt-0.5 block text-xs ${mute}`}>{entry.actorEmail}</span>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{entry.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{entry.subject}</td>
                    <td className={`max-w-md px-4 py-3 pr-5 ${mute}`}>{entry.detail}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className={`px-5 py-8 ${mute}`}>
                  No changes recorded yet. New edits, invites, and env updates will show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3 text-sm dark:border-ink-700">
          <button type="button" className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className={mute}>
            {page} / {data.totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
