"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/brand/icons";
import { ago } from "@/lib/format";
import { mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { useListNotificationsQuery, useMarkNotificationsReadMutation, useRespondInviteMutation } from "@/store/Reducer/invites-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

export function NotificationBell({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { me } = useVault();
  const router = useRouter();
  const [fresh, setFresh] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data } = useListNotificationsQuery({ page: 1, limit: 50 }, { skip: !me });
  const [respondInvite] = useRespondInviteMutation();
  const [markRead] = useMarkNotificationsReadMutation();
  const notes = data?.data ?? [];
  const count = notes.filter((note) => (note.kind === "invite" ? note.status === "pending" : !note.read)).length;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!me) return null;

  function toggle() {
    if (open) {
      onOpenChange(false);
      return;
    }
    setFresh(notes.filter((note) => note.kind === "info" && !note.read).map((note) => note.id));
    markRead();
    onOpenChange(true);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-[#4b535d] hover:bg-[#eff2f5] dark:border-ink-650 dark:text-ink-200 dark:hover:bg-ink-800"
        aria-label="Notifications"
        title="Notifications"
        aria-expanded={open}
        onClick={toggle}
      >
        <BellIcon />
        {count ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="fade surface absolute right-0 top-11 z-30 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white dark:border-ink-700 dark:bg-ink-900">
          <p className="border-b border-line px-4 py-2.5 text-sm font-bold dark:border-ink-700">Notifications</p>
          <div className="max-h-96 overflow-y-auto">
            {notes.length ? (
              notes.map((note) => {
                const workspaceName = note.workspaceName || "a workspace";
                if (note.kind === "invite" && note.status === "pending") {
                  return (
                    <div key={note.id} className="border-b border-[#eaeef2] px-4 py-3 last:border-0 dark:border-ink-700">
                      <p className="text-sm">
                        <b>{note.fromEmail}</b> invited you to join <b>{workspaceName}</b> with {note.access === "edit" ? "edit" : "view"} access
                      </p>
                      <p className={`mt-0.5 text-xs ${mute}`}>{ago(note.at)}</p>
                      <div className="mt-2 flex gap-2 text-xs font-semibold">
                        <button
                          type="button"
                          className="btn-p rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
                          onClick={async () => {
                            try {
                              const result = await respondInvite({ id: note.id, accept: true }).unwrap();
                              onOpenChange(false);
                              if (result.status === "joined" && result.workspaceId) {
                                router.push(`/workspaces/${result.workspaceId}`);
                                showSuccess(`You joined ${result.name}`);
                              } else if (result.status === "missing") showError("That workspace no longer exists");
                            } catch (error) {
                              showError(getErrorMessage(error));
                            }
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-line px-3 py-1.5 hover:bg-[#eff2f5] dark:border-ink-650 dark:hover:bg-ink-800"
                          onClick={async () => {
                            try {
                              const result = await respondInvite({ id: note.id, accept: false }).unwrap();
                              onOpenChange(false);
                              if (result.status === "missing") showError("That workspace no longer exists");
                              else showSuccess("Invite declined");
                            } catch (error) {
                              showError(getErrorMessage(error));
                            }
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                }
                const unread = note.kind === "info" && fresh.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className={`border-b border-[#eaeef2] px-4 py-3 last:border-0 dark:border-ink-700 ${unread ? "bg-brand-50/60 dark:bg-brand-500/5" : ""}`}
                  >
                    <p className="text-sm">
                      {note.kind === "invite" ? (
                        note.status === "accepted" ? (
                          <>
                            You joined <b>{workspaceName}</b>
                          </>
                        ) : (
                          <>
                            You declined the invite to <b>{workspaceName}</b>
                          </>
                        )
                      ) : (
                        note.text
                      )}
                    </p>
                    <p className={`mt-0.5 text-xs ${mute}`}>{ago(note.at)}</p>
                  </div>
                );
              })
            ) : (
              <p className={`p-6 text-center text-sm ${mute}`}>No notifications yet</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
