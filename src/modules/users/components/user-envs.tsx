"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Crumbs } from "@/components/brand/crumbs";
import { EnvChip } from "@/components/brand/env-chip";
import { Skeleton } from "@/components/brand/skeleton";
import { plural } from "@/lib/format";
import { card, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { useListUserEnvsQuery } from "@/store/Reducer/envs-api";
import { useGetUserQuery } from "@/store/Reducer/users-api";

function readId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ?? "";
}

export function UserEnvsPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const { me } = useVault();
  const userId = readId(params.userId);
  const { data: user, isLoading: loadingUser } = useGetUserQuery(userId, { skip: !userId || me?.role !== "admin" });
  const { data, isLoading } = useListUserEnvsQuery({ userId, page: 1, limit: 50 }, { skip: !userId || me?.role !== "admin" });

  useEffect(() => {
    if (me?.role === "admin" && !loadingUser && (!user || user.role === "admin")) router.replace("/users");
  }, [me, router, user, loadingUser]);

  if (!me || me.role !== "admin" || !user || user.role === "admin") return null;

  const envs = data?.data ?? [];

  return (
    <div className="fade">
      <Crumbs items={[{ href: "/users", label: "Users" }, { href: `/users/${user.id}`, label: user.name }, { label: "Env files" }]} />
      <h1 className="mt-4 text-2xl font-extrabold">Env files</h1>
      <p className={`mt-1 text-sm ${mute}`}>
        {plural(data?.totalRecords ?? envs.length, "file")} created by {user.name}.
      </p>
      {isLoading ? (
        <div className={`${card} mt-6 divide-y divide-[#eaeef2] dark:divide-ink-700`} aria-busy="true" aria-label="Loading env files">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && envs.length ? (
        <ul className={`${card} mt-6 divide-y divide-[#eaeef2] dark:divide-ink-700`}>
          {envs.map((env) => (
            <li key={env.id}>
              <Link href={`/envs/${env.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f6f8fa] sm:px-5 dark:hover:bg-ink-800/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{env.name}</p>
                  <p className={`mt-0.5 truncate text-xs ${mute}`}>
                    {env.workspaceId ? "Shared" : "Personal"} · {plural(env.vars.length, "variable")}
                  </p>
                </div>
                <EnvChip env={env.env} />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {!isLoading && !envs.length ? <p className={`${card} mt-6 px-5 py-8 text-sm ${mute}`}>No env files yet.</p> : null}
    </div>
  );
}
