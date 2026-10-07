"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/brand/avatar";
import { Skeleton } from "@/components/brand/skeleton";
import { EyeIcon, PencilIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { plural } from "@/lib/format";
import { card, input, mute } from "@/lib/styles";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useVault } from "@/lib/store";
import { EditUserModal } from "@/modules/users/components/edit-user-modal";
import { useListUsersQuery } from "@/store/Reducer/users-api";
import { getErrorMessage } from "@/utils/api";
import type { AuthUser } from "@/store/Reducer/auth-api";

type UserTab = "all" | "pm" | "dev";

function joinedOn(value: number | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    value,
  );
}

export function UserList() {
  const { me } = useVault();
  const router = useRouter();
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<UserTab>("all");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const search = useDebouncedValue(keyword.trim());
  const role = tab === "all" ? undefined : tab;
  const { data, isLoading, isError, error } = useListUsersQuery({
    page,
    limit: 20,
    role,
    keyword: search || undefined,
  });
  if (!me) return null;

  const listed = data?.data ?? [];
  const counts = data?.counts;

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <p className={`mt-1 text-sm ${mute}`}>
        {plural(counts?.all ?? 0, "account")}.
      </p>
      <input
        value={keyword}
        placeholder="Search name or email"
        onChange={(event) => {
          setKeyword(event.target.value);
          setPage(1);
        }}
        className={`mt-4 sm:max-w-xs ${input}`}
      />

      <div className={`${card} mt-6`}>
        <div className="tab-scroll flex gap-1 border-b border-line px-2 text-sm font-semibold dark:border-ink-700">
          {(
            [
              ["all", `All (${counts?.all ?? 0})`],
              ["pm", `Project Managers (${counts?.projectManagers ?? 0})`],
              ["dev", `Users (${counts?.devs ?? 0})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`-mb-px shrink-0 border-b-2 px-3 py-3 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs font-semibold tracking-wide text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400">
                {["User", "Joined", "Status", "Role", "Actions"].map(
                  (column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 font-semibold whitespace-nowrap first:pl-5 last:pr-5 last:text-right"
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#eaeef2] last:border-0 dark:border-ink-700"
                  >
                    <td className="px-4 py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </td>
                    <td className="px-4 py-3 pr-5">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-rose-600 dark:text-rose-400"
                  >
                    {getErrorMessage(error)}
                  </td>
                </tr>
              ) : listed.length ? (
                listed.map((user) => {
                  const href = `/users/${user.id}`;
                  return (
                    <tr
                      key={user.email}
                      role="link"
                      tabIndex={0}
                      aria-label={`View ${user.name}`}
                      className="cursor-pointer border-b border-[#eaeef2] last:border-0 hover:bg-[#f6f8fa] dark:border-ink-700 dark:hover:bg-ink-800/50"
                      onClick={() => router.push(href)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(href);
                        }
                      }}
                    >
                      <td className="px-4 py-3 pl-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar email={user.email} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {user.name}
                            </p>
                            <p className={`truncate text-xs ${mute}`}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {joinedOn(user.created)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                            user.status
                              ? "border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-emerald-300"
                              : "border-line bg-canvas text-mute dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400"
                          }`}
                        >
                          {user.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RoleChip role={user.role} />
                      </td>
                      <td className="px-4 py-3 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <span
                            aria-hidden
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#8c959f] dark:text-ink-400"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </span>
                          <button
                            type="button"
                            aria-label={`Edit ${user.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#8c959f] hover:bg-[#eff2f5] hover:text-fg dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(user);
                            }}
                          >
                            <PencilIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className={`px-5 py-8 ${mute}`}>
                    No accounts in this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3 text-sm dark:border-ink-700">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 font-medium disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
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
      <EditUserModal user={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
