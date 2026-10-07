"use client";

import { useState } from "react";
import { Avatar } from "@/components/brand/avatar";
import { TrashIcon } from "@/components/brand/icons";
import { RoleChip } from "@/components/brand/role-chip";
import { btn, card, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { AccessChoice } from "@/modules/workspaces/components/access-choice";
import { useRemoveMemberMutation, useSetMemberAccessMutation } from "@/store/Reducer/invites-api";
import type { Workspace, WorkspaceMember } from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

export function MemberList({ workspace, canManage }: { workspace: Workspace; canManage: boolean }) {
  const { me } = useVault();
  const [draft, setDraft] = useState<Record<string, "view" | "edit"> | null>(null);
  const [removeMember] = useRemoveMemberMutation();
  const [setMemberAccess, { isLoading: saving }] = useSetMemberAccessMutation();
  if (!me) return null;

  function accessFor(member: WorkspaceMember) {
    return draft?.[member.id] ?? member.access;
  }

  const dirty = workspace.members.filter((member) => accessFor(member) !== member.access);

  async function save() {
    try {
      await Promise.all(
        dirty.map((member) =>
          setMemberAccess({ workspaceId: workspace.id, userId: member.id, access: accessFor(member) }).unwrap(),
        ),
      );
      setDraft(null);
      showSuccess(dirty.length === 1 ? "Access saved" : "Access saved for the updated members");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  }

  return (
    <div className={`${card} lg:col-span-3`}>
      <div className="border-b border-line px-5 py-4 dark:border-ink-700">
        <h2 className="text-sm font-bold">People ({workspace.members.length + 1})</h2>
        <p className={`mt-1 text-xs ${mute}`}>{canManage ? "Choose who can change env files, then save." : "People in this workspace."}</p>
      </div>
      <MemberRow name={workspace.ownerName} email={workspace.ownerEmail} you={workspace.ownerEmail === me.email} note="Workspace owner" role="pm" />
      {workspace.members.map((member) => (
        <div key={member.id} className="flex flex-col gap-3 border-b border-[#eaeef2] px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:px-5 dark:border-ink-700">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar email={member.email} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {member.name}
                  {member.email === me.email ? <span className={`font-normal ${mute}`}> (you)</span> : null}
                </p>
                <RoleChip role="dev" />
              </div>
              <p className={`truncate text-xs ${mute}`}>{member.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {canManage ? (
              <AccessChoice
                label={`Access for ${member.name}`}
                value={accessFor(member)}
                onChange={(access) => setDraft((current) => ({ ...(current ?? {}), [member.id]: access }))}
              />
            ) : (
              <span className={`text-xs font-medium ${mute}`}>{accessFor(member) === "edit" ? "Can edit" : "Can view"}</span>
            )}
            {canManage ? (
              <button
                type="button"
                aria-label={`Remove ${member.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={async () => {
                  if (!confirm(`Remove ${member.name} from ${workspace.name}? They will lose access to its envs.`)) return;
                  try {
                    await removeMember({ workspaceId: workspace.id, userId: member.id }).unwrap();
                    showSuccess("Member removed");
                  } catch (error) {
                    showError(getErrorMessage(error));
                  }
                }}
              >
                <TrashIcon />
              </button>
            ) : null}
          </div>
        </div>
      ))}
      {canManage && dirty.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 dark:border-ink-700">
          <p className={`text-xs ${mute}`}>Access changes are not saved yet.</p>
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => setDraft(null)}>
              Discard
            </button>
            <button type="button" className={primary} disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MemberRow({ name, email, you, note, role }: { name: string; email: string; you: boolean; note: string; role: "pm" | "dev" }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#eaeef2] px-4 py-4 sm:px-5 dark:border-ink-700">
      <Avatar email={email} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">
            {name}
            {you ? <span className={`font-normal ${mute}`}> (you)</span> : null}
          </p>
          <RoleChip role={role} />
        </div>
        <p className={`truncate text-xs ${mute}`}>
          {email}
          <span> · {note}</span>
        </p>
      </div>
    </div>
  );
}
