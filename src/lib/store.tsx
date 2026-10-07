"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore, useState, type ReactNode } from "react";
import { describeChanges, keyList, writeAudit } from "@/lib/audit";
import { DB_KEY, load, save } from "@/lib/db";
import { deviceLabel, uid } from "@/lib/format";
import { canCreateIn, canEdit } from "@/lib/permissions";
import { clearResetChallenge, createResetCode, currentReset, markResetVerified, noteResetAttempt, saveResetChallenge } from "@/modules/auth/lib/reset";
import { SESSION_KEY } from "@/modules/auth/lib/session";
import type { DB, EnvKind, MemberAccess, User } from "@/lib/types";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: "pm" | "dev";
};

type InviteResult =
  | { status: "joined"; workspaceId: string; name: string }
  | { status: "declined" }
  | { status: "missing" };

type VaultContextValue = {
  ready: boolean;
  db: DB;
  me: User | null;
  toastMessage: string | null;
  toast: (message: string) => void;
  login: (email: string, password: string) => { error: string | null; role: User["role"] | null };
  signup: (input: SignupInput) => string | null;
  logout: () => void;
  attachAccount: (account: { email: string; name: string; role: User["role"]; phone: string; image: string | null; status: boolean }) => void;
  updateProfile: (input: { name: string; phone: string; image: string | null }) => boolean;
  changePassword: (input: { current: string; next: string }) => string | null;
  requestReset: (email: string) => string | null;
  verifyReset: (code: string) => string | null;
  finishReset: (password: string) => string | null;
  updateUser: (email: string, input: { name: string; role: User["role"]; active: boolean }) => string | null;
  createEnv: (input: { name: string; desc: string; env: EnvKind; project: string | null }) => string | null;
  updateEnv: (id: string, input: { name: string; desc: string; env: EnvKind }) => boolean;
  createProject: (input: { name: string; desc: string; ws: string }) => string | null;
  updateProject: (id: string, input: { name: string; desc: string }) => boolean;
  deleteProject: (id: string) => boolean;
  deleteEnv: (id: string) => boolean;
  upsertVar: (envId: string, key: string, value: string) => boolean;
  removeVar: (envId: string, key: string) => boolean;
  importVars: (envId: string, pairs: { k: string; v: string }[]) => boolean;
  createWorkspace: (input: { name: string; desc: string }) => string | null;
  updateWorkspace: (id: string, input: { name: string; desc: string }) => boolean;
  deleteWorkspace: (id: string) => boolean;
  invite: (workspaceId: string, email: string, access: MemberAccess) => string | null;
  cancelInvite: (id: string) => void;
  respondInvite: (id: string, accept: boolean) => InviteResult;
  removeMember: (workspaceId: string, email: string) => boolean;
  setMemberAccess: (workspaceId: string, email: string, access: MemberAccess) => boolean;
  markInfoRead: () => void;
};

const VaultContext = createContext<VaultContextValue | null>(null);

const emptyDb = (): DB => ({ users: [], workspaces: [], projects: [], envs: [], notifs: [], audits: [] });

type Snapshot = { ready: boolean; db: DB; email: string | null };

const serverSnapshot: Snapshot = { ready: false, db: emptyDb(), email: null };
let snapshot: Snapshot = serverSnapshot;
let cachedRaw: string | null = null;
const listeners = new Set<() => void>();

function readEmail() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function readDb() {
  if (typeof window === "undefined") return snapshot.db;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(DB_KEY);
  } catch {
    return snapshot.db;
  }
  if (snapshot.ready && raw === cachedRaw) return snapshot.db;
  const db = load();
  try {
    cachedRaw = localStorage.getItem(DB_KEY);
  } catch {
    cachedRaw = raw;
  }
  return db;
}

function liveDb() {
  return snapshot.ready ? snapshot.db : readDb();
}

function liveEmail() {
  return snapshot.ready ? snapshot.email : readEmail();
}

function publish(db: DB, email: string | null) {
  try {
    cachedRaw = localStorage.getItem(DB_KEY);
  } catch {
    cachedRaw = JSON.stringify(db);
  }
  snapshot = { ready: true, db, email };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== DB_KEY) return;
    cachedRaw = null;
    snapshot = { ready: true, db: load(), email: readEmail() };
    try {
      cachedRaw = localStorage.getItem(DB_KEY);
    } catch {
      cachedRaw = null;
    }
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot() {
  const db = readDb();
  const email = readEmail();
  if (snapshot.ready && snapshot.db === db && snapshot.email === email) return snapshot;
  snapshot = { ready: true, db, email };
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function Providers({ children }: { children: ReactNode }) {
  const { ready, db, email: sessionEmail } = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const me = sessionEmail ? db.users.find((user) => user.email === sessionEmail) ?? null : null;

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2400);
  }, []);

  const commit = useCallback((recipe: (draft: DB) => void) => {
    const next = structuredClone(liveDb());
    recipe(next);
    try {
      save(next);
    } catch {
      setToastMessage("Could not save. Browser storage is unavailable.");
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastMessage(null), 2400);
      return false;
    }
    publish(next, liveEmail());
    return true;
  }, []);

  const currentUser = useCallback(() => {
    const email = liveEmail();
    if (!email) return null;
    return liveDb().users.find((user) => user.email === email) ?? null;
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      const user = liveDb().users.find((item) => item.email === normalized);
      if (!user || user.password !== password) return { error: "Wrong email or password.", role: null };
      if (user.active === false) return { error: "This account is inactive. Ask an admin to activate it.", role: null };
      const device = deviceLabel(typeof navigator === "undefined" ? "" : navigator.userAgent);
      commit((draft) => {
        const current = draft.users.find((item) => item.email === normalized);
        if (!current) return;
        const now = Date.now();
        current.lastLogin = now;
        current.lastDevice = device;
        const cutoff = now - 400 * 24 * 60 * 60 * 1000;
        current.logins = [...(Array.isArray(current.logins) ? current.logins : []), now].filter((at) => at >= cutoff);
      });
      try {
        sessionStorage.setItem(SESSION_KEY, user.email);
      } catch {
        /* session still lives in memory for this tab */
      }
      publish(liveDb(), user.email);
      return { error: null, role: user.role };
    },
    [commit],
  );

  const signup = useCallback(
    (input: SignupInput) => {
      const email = input.email.trim().toLowerCase();
      if (liveDb().users.some((user) => user.email === email)) {
        return "An account with this email already exists. Sign in instead.";
      }
      if (input.password.length < 6) return "Use a password with at least 6 characters.";
      if (input.role !== "pm" && input.role !== "dev") return "Choose Project Manager or Dev.";
      const now = Date.now();
      const user: User = {
        email,
        name: input.name.trim(),
        role: input.role,
        password: input.password,
        phone: "",
        image: null,
        active: true,
        created: now,
        lastLogin: now,
        lastDevice: deviceLabel(typeof navigator === "undefined" ? "" : navigator.userAgent),
        logins: [now],
      };
      if (!commit((draft) => draft.users.push(user))) return "Could not save. Browser storage is unavailable.";
      try {
        sessionStorage.setItem(SESSION_KEY, user.email);
      } catch {
        /* session still lives in memory for this tab */
      }
      publish(liveDb(), user.email);
      return null;
    },
    [commit],
  );

  const updateProfile = useCallback(
    (input: { name: string; phone: string; image: string | null }) => {
      const user = currentUser();
      const name = input.name.trim();
      if (!user || !name) return false;
      return commit((draft) => {
        const current = draft.users.find((item) => item.email === user.email);
        if (!current) return;
        current.name = name;
        current.phone = input.phone.trim();
        current.image = input.image;
      });
    },
    [commit, currentUser],
  );

  const changePassword = useCallback(
    (input: { current: string; next: string }) => {
      const user = currentUser();
      if (!user) return "Sign in again to change your password.";
      if (input.current !== user.password) return "Current password is not correct.";
      if (input.next.length < 6) return "Use a password with at least 6 characters.";
      if (input.next === user.password) return "New password must be different from the current one.";
      const ok = commit((draft) => {
        const current = draft.users.find((item) => item.email === user.email);
        if (!current) return;
        current.password = input.next;
      });
      return ok ? null : "Could not save. Browser storage is unavailable.";
    },
    [commit, currentUser],
  );

  const requestReset = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase();
    const user = liveDb().users.find((item) => item.email === normalized);
    if (!user) return "No account with that email.";
    if (user.active === false) return "This account is inactive. Ask an admin to activate it.";
    saveResetChallenge(normalized, createResetCode());
    return null;
  }, []);

  const verifyReset = useCallback((code: string) => {
    const challenge = currentReset();
    if (!challenge) return "Request a new code.";
    if (challenge.attempts >= 5) return "Too many tries. Request a new code.";
    if (challenge.code !== code.trim()) {
      noteResetAttempt();
      return "That code is not correct.";
    }
    markResetVerified();
    return null;
  }, []);

  const finishReset = useCallback(
    (password: string) => {
      const challenge = currentReset();
      if (!challenge?.verified) return "Verify the code before choosing a new password.";
      if (password.length < 6) return "Use a password with at least 6 characters.";
      const user = liveDb().users.find((item) => item.email === challenge.email);
      if (!user) return "No account with that email.";
      if (password === user.password) return "New password must be different from the current one.";
      const ok = commit((draft) => {
        const current = draft.users.find((item) => item.email === challenge.email);
        if (!current) return;
        current.password = password;
      });
      if (!ok) return "Could not save. Browser storage is unavailable.";
      clearResetChallenge();
      return null;
    },
    [commit],
  );

  const attachAccount = useCallback(
    (account: { email: string; name: string; role: User["role"]; phone: string; image: string | null; status: boolean }) => {
      try {
        sessionStorage.setItem(SESSION_KEY, account.email);
      } catch {
        /* session still lives in memory for this tab */
      }
      commit((draft) => {
        const existing = draft.users.find((item) => item.email === account.email);
        if (!existing) {
          draft.users.push({
            email: account.email,
            name: account.name,
            role: account.role,
            password: "",
            phone: account.phone,
            image: account.image,
            active: account.status,
            created: null,
            lastLogin: null,
            lastDevice: null,
            logins: [],
          });
          return;
        }
        existing.name = account.name;
        existing.role = account.role;
        existing.phone = account.phone;
        existing.image = account.image;
        existing.active = account.status;
      });
      publish(liveDb(), account.email);
    },
    [commit],
  );

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    publish(liveDb(), null);
  }, []);

  const createEnv = useCallback(
    (input: { name: string; desc: string; env: EnvKind; project: string | null }) => {
      const user = currentUser();
      if (!user) return null;
      const project = input.project ? liveDb().projects.find((item) => item.id === input.project) : null;
      if (input.project) {
        const workspace = project ? liveDb().workspaces.find((item) => item.id === project.ws) : null;
        if (!project || !workspace || !canCreateIn(user, workspace)) return null;
      } else if (user.role !== "dev") {
        return null;
      }
      const id = uid();
      const ok = commit((draft) => {
        draft.envs.unshift({
          id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          env: input.env,
          vars: [],
          updated: Date.now(),
          owner: user.email,
          ws: project ? project.ws : null,
          project: project ? project.id : null,
        });
        if (project) {
          writeAudit(draft, {
            ws: project.ws,
            by: user.email,
            action: "Created env",
            subject: input.name.trim(),
            detail: `Added a ${input.env} env in ${project.name}.${input.desc.trim() ? ` Description: "${input.desc.trim()}".` : ""}`,
          });
        }
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const updateEnv = useCallback(
    (id: string, input: { name: string; desc: string; env: EnvKind }) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === id);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => {
        const current = draft.envs.find((item) => item.id === id);
        if (!current) return;
        const detail = describeChanges([
          { label: "Name", from: current.name, to: input.name.trim() },
          { label: "Description", from: current.desc, to: input.desc.trim() },
          { label: "Environment", from: current.env, to: input.env },
        ]);
        const projectName = current.project ? draft.projects.find((item) => item.id === current.project)?.name : "";
        current.name = input.name.trim();
        current.desc = input.desc.trim();
        current.env = input.env;
        current.updated = Date.now();
        if (detail && current.ws) {
          writeAudit(draft, {
            ws: current.ws,
            by: user.email,
            action: "Updated env",
            subject: current.name,
            detail: projectName ? `${detail}. Project: ${projectName}.` : `${detail}.`,
          });
        }
      });
    },
    [commit, currentUser],
  );

  const deleteEnv = useCallback(
    (id: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === id);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => {
        const projectName = env.project ? draft.projects.find((item) => item.id === env.project)?.name : "";
        if (env.ws) {
          writeAudit(draft, {
            ws: env.ws,
            by: user.email,
            action: "Deleted env",
            subject: env.name,
            detail: `Removed ${env.vars.length} variable${env.vars.length === 1 ? "" : "s"}${projectName ? ` from ${projectName}` : ""}.`,
          });
        }
        draft.envs = draft.envs.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const touchEnv = (draft: DB, envId: string, key: string, value: string | null) => {
    const env = draft.envs.find((item) => item.id === envId);
    if (!env) return;
    if (value === null) env.vars = env.vars.filter((item) => item.k !== key);
    else {
      const existing = env.vars.find((item) => item.k === key);
      if (existing) existing.v = value;
      else env.vars.push({ k: key, v: value });
    }
    env.updated = Date.now();
  };

  const upsertVar = useCallback(
    (envId: string, key: string, value: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      const existed = env.vars.some((item) => item.k === key);
      const unchanged = env.vars.some((item) => item.k === key && item.v === value);
      return commit((draft) => {
        touchEnv(draft, envId, key, value);
        if (unchanged || !env.ws) return;
        const projectName = env.project ? draft.projects.find((item) => item.id === env.project)?.name : "";
        writeAudit(draft, {
          ws: env.ws,
          by: user.email,
          action: existed ? "Updated variable" : "Added variable",
          subject: env.name,
          detail: `${existed ? "Updated" : "Added"} key ${key}${projectName ? ` in ${projectName}` : ""}.`,
        });
      });
    },
    [commit, currentUser],
  );

  const removeVar = useCallback(
    (envId: string, key: string) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      const existed = env.vars.some((item) => item.k === key);
      return commit((draft) => {
        touchEnv(draft, envId, key, null);
        if (!existed || !env.ws) return;
        const projectName = env.project ? draft.projects.find((item) => item.id === env.project)?.name : "";
        writeAudit(draft, {
          ws: env.ws,
          by: user.email,
          action: "Removed variable",
          subject: env.name,
          detail: `Removed key ${key}${projectName ? ` from ${projectName}` : ""}.`,
        });
      });
    },
    [commit, currentUser],
  );

  const importVars = useCallback(
    (envId: string, pairs: { k: string; v: string }[]) => {
      const user = currentUser();
      const env = liveDb().envs.find((item) => item.id === envId);
      if (!user || !env || !canEdit(user, env, liveDb())) return false;
      return commit((draft) => {
        pairs.forEach((pair) => touchEnv(draft, envId, pair.k, pair.v));
        if (!env.ws) return;
        const projectName = env.project ? draft.projects.find((item) => item.id === env.project)?.name : "";
        writeAudit(draft, {
          ws: env.ws,
          by: user.email,
          action: "Imported variables",
          subject: env.name,
          detail: `Imported ${pairs.length} key${pairs.length === 1 ? "" : "s"}${projectName ? ` into ${projectName}` : ""}: ${keyList(pairs.map((pair) => pair.k))}.`,
        });
      });
    },
    [commit, currentUser],
  );

  const createWorkspace = useCallback(
    (input: { name: string; desc: string }) => {
      const user = currentUser();
      if (!user || user.role !== "pm") return null;
      const id = uid();
      const ok = commit((draft) => {
        draft.workspaces.unshift({
          id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          pm: user.email,
          members: [],
          editors: [],
          created: Date.now(),
        });
        writeAudit(draft, {
          ws: id,
          by: user.email,
          action: "Created workspace",
          subject: input.name.trim(),
          detail: input.desc.trim() ? `Description: "${input.desc.trim()}".` : "No description.",
        });
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const updateWorkspace = useCallback(
    (id: string, input: { name: string; desc: string }) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === id);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        const current = draft.workspaces.find((item) => item.id === id);
        if (!current) return;
        const detail = describeChanges([
          { label: "Name", from: current.name, to: input.name.trim() },
          { label: "Description", from: current.desc, to: input.desc.trim() },
        ]);
        current.name = input.name.trim();
        current.desc = input.desc.trim();
        if (detail) {
          writeAudit(draft, { ws: id, by: user.email, action: "Updated workspace", subject: current.name, detail: `${detail}.` });
        }
      });
    },
    [commit, currentUser],
  );

  const deleteWorkspace = useCallback(
    (id: string) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === id);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        draft.envs = draft.envs.filter((env) => env.ws !== id);
        draft.projects = draft.projects.filter((project) => project.ws !== id);
        draft.notifs = draft.notifs.filter((note) => !("ws" in note) || note.ws !== id);
        draft.audits = (draft.audits ?? []).filter((entry) => entry.ws !== id);
        draft.workspaces = draft.workspaces.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const createProject = useCallback(
    (input: { name: string; desc: string; ws: string }) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === input.ws);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return null;
      const id = uid();
      const ok = commit((draft) => {
        draft.projects.unshift({
          id,
          ws: workspace.id,
          name: input.name.trim(),
          desc: input.desc.trim(),
          owner: user.email,
          created: Date.now(),
        });
        writeAudit(draft, {
          ws: workspace.id,
          by: user.email,
          action: "Created project",
          subject: input.name.trim(),
          detail: input.desc.trim() ? `Description: "${input.desc.trim()}".` : "No description.",
        });
      });
      return ok ? id : null;
    },
    [commit, currentUser],
  );

  const updateProject = useCallback(
    (id: string, input: { name: string; desc: string }) => {
      const user = currentUser();
      const project = liveDb().projects.find((item) => item.id === id);
      const workspace = project ? liveDb().workspaces.find((item) => item.id === project.ws) : null;
      if (!user || !project || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        const current = draft.projects.find((item) => item.id === id);
        if (!current) return;
        const detail = describeChanges([
          { label: "Name", from: current.name, to: input.name.trim() },
          { label: "Description", from: current.desc, to: input.desc.trim() },
        ]);
        current.name = input.name.trim();
        current.desc = input.desc.trim();
        if (detail) {
          writeAudit(draft, { ws: current.ws, by: user.email, action: "Updated project", subject: current.name, detail: `${detail}.` });
        }
      });
    },
    [commit, currentUser],
  );

  const deleteProject = useCallback(
    (id: string) => {
      const user = currentUser();
      const project = liveDb().projects.find((item) => item.id === id);
      const workspace = project ? liveDb().workspaces.find((item) => item.id === project.ws) : null;
      if (!user || !project || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      const envCount = liveDb().envs.filter((env) => env.project === id).length;
      return commit((draft) => {
        writeAudit(draft, {
          ws: workspace.id,
          by: user.email,
          action: "Deleted project",
          subject: project.name,
          detail: `Removed the project and ${envCount} env file${envCount === 1 ? "" : "s"} inside it.`,
        });
        draft.envs = draft.envs.filter((env) => env.project !== id);
        draft.projects = draft.projects.filter((item) => item.id !== id);
      });
    },
    [commit, currentUser],
  );

  const invite = useCallback(
    (workspaceId: string, email: string, access: MemberAccess) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === workspaceId);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return "You cannot invite from here";
      const normalized = email.trim().toLowerCase();
      const target = liveDb().users.find((item) => item.email === normalized);
      if (!target) return "No account with that email";
      if (target.role !== "dev") return "Only Dev accounts can be invited";
      if (target.active === false) return "That account is inactive";
      if (workspace.members.includes(normalized)) return "Already in this workspace";
      const pending = liveDb().notifs.some(
        (note) => note.kind === "invite" && note.ws === workspace.id && note.to === normalized && note.status === "pending",
      );
      if (pending) return "Invite already sent";
      commit((draft) => {
        draft.notifs.push({
          id: uid(),
          kind: "invite",
          to: normalized,
          from: user.email,
          ws: workspace.id,
          wsName: workspace.name,
          access,
          status: "pending",
          read: false,
          at: Date.now(),
        });
        writeAudit(draft, {
          ws: workspace.id,
          by: user.email,
          action: "Invited member",
          subject: target.name,
          detail: `Invited ${normalized} with ${access} access.`,
        });
      });
      return null;
    },
    [commit, currentUser],
  );

  const cancelInvite = useCallback(
    (id: string) => {
      const user = currentUser();
      commit((draft) => {
        const note = draft.notifs.find((item) => item.id === id);
        draft.notifs = draft.notifs.filter((item) => item.id !== id);
        if (!user || !note || note.kind !== "invite") return;
        const person = draft.users.find((item) => item.email === note.to);
        writeAudit(draft, {
          ws: note.ws,
          by: user.email,
          action: "Cancelled invite",
          subject: person?.name ?? note.to,
          detail: `Cancelled a pending ${note.access === "edit" ? "edit" : "view"} invite to ${note.to}.`,
        });
      });
    },
    [commit, currentUser],
  );

  const respondInvite = useCallback(
    (id: string, accept: boolean): InviteResult => {
      const user = currentUser();
      const note = liveDb().notifs.find((item) => item.id === id);
      if (!user || !note || note.kind !== "invite") return { status: "missing" };
      const workspace = liveDb().workspaces.find((item) => item.id === note.ws);
      commit((draft) => {
        const current = draft.notifs.find((item) => item.id === id);
        if (!current || current.kind !== "invite") return;
        const live = draft.workspaces.find((item) => item.id === current.ws);
        current.status = accept && live ? "accepted" : "declined";
        if (!live) return;
        if (accept && !live.members.includes(user.email)) live.members.push(user.email);
        if (!Array.isArray(live.editors)) live.editors = [];
        if (accept && current.access === "edit" && !live.editors.includes(user.email)) live.editors.push(user.email);
        if (accept && current.access !== "edit") live.editors = live.editors.filter((member) => member !== user.email);
        draft.notifs.push({
          id: uid(),
          kind: "info",
          to: current.from,
          text: `${user.name} ${accept ? "accepted" : "declined"} your invite to ${live.name}`,
          read: false,
          at: Date.now(),
        });
        writeAudit(draft, {
          ws: live.id,
          by: user.email,
          action: accept ? "Joined workspace" : "Declined invite",
          subject: user.name,
          detail: accept
            ? `Accepted the invite with ${current.access === "edit" ? "edit" : "view"} access.`
            : `Declined the invite (${current.access === "edit" ? "edit" : "view"} access).`,
        });
      });
      if (!workspace) return { status: "missing" };
      if (accept) return { status: "joined", workspaceId: workspace.id, name: workspace.name };
      return { status: "declined" };
    },
    [commit, currentUser],
  );

  const removeMember = useCallback(
    (workspaceId: string, email: string) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === workspaceId);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      return commit((draft) => {
        const live = draft.workspaces.find((item) => item.id === workspaceId);
        if (!live) return;
        live.members = live.members.filter((member) => member !== email);
        live.editors = (live.editors ?? []).filter((member) => member !== email);
        const person = draft.users.find((item) => item.email === email);
        draft.notifs.push({
          id: uid(),
          kind: "info",
          to: email,
          text: `You were removed from ${live.name}`,
          read: false,
          at: Date.now(),
        });
        writeAudit(draft, {
          ws: live.id,
          by: user.email,
          action: "Removed member",
          subject: person?.name ?? email,
          detail: `Removed ${email} from the workspace.`,
        });
      });
    },
    [commit, currentUser],
  );

  const setMemberAccess = useCallback(
    (workspaceId: string, email: string, access: MemberAccess) => {
      const user = currentUser();
      const workspace = liveDb().workspaces.find((item) => item.id === workspaceId);
      if (!user || !workspace || (user.role !== "admin" && workspace.pm !== user.email)) return false;
      if (!workspace.members.includes(email)) return false;
      return commit((draft) => {
        const live = draft.workspaces.find((item) => item.id === workspaceId);
        if (!live) return;
        if (!Array.isArray(live.editors)) live.editors = [];
        const editing = live.editors.includes(email);
        const previous: MemberAccess = editing ? "edit" : "view";
        if (previous === access) return;
        if (access === "edit") live.editors.push(email);
        else live.editors = live.editors.filter((member) => member !== email);
        const person = draft.users.find((item) => item.email === email);
        writeAudit(draft, {
          ws: live.id,
          by: user.email,
          action: "Changed access",
          subject: person?.name ?? email,
          detail: `Access for ${email} changed from ${previous} to ${access}.`,
        });
      });
    },
    [commit, currentUser],
  );

  const updateUser = useCallback(
    (email: string, input: { name: string; role: User["role"]; active: boolean }) => {
      const user = currentUser();
      if (!user || user.role !== "admin") return "Only an admin can edit users.";
      const normalized = email.trim().toLowerCase();
      const name = input.name.trim();
      if (!name) return "Name is required.";
      if (input.role !== "admin" && input.role !== "pm" && input.role !== "dev") return "Choose a valid role.";
      const target = liveDb().users.find((item) => item.email === normalized);
      if (!target) return "No account with that email.";
      if (input.role === "admin" && target.role !== "admin") return "There is only one admin account.";
      if (user.email === normalized && input.role !== target.role) return "You cannot change your own role.";
      if (user.email === normalized && !input.active) return "You cannot deactivate your own account.";
      const ok = commit((draft) => {
        const current = draft.users.find((item) => item.email === normalized);
        if (!current) return;
        current.name = name;
        current.role = input.role;
        current.active = input.active;
      });
      return ok ? null : "Could not save. Browser storage is unavailable.";
    },
    [commit, currentUser],
  );

  const markInfoRead = useCallback(() => {
    const email = liveEmail();
    if (!email) return;
    const unread = liveDb().notifs.some((note) => note.kind === "info" && note.to === email && !note.read);
    if (!unread) return;
    commit((draft) => {
      draft.notifs.forEach((note) => {
        if (note.kind === "info" && note.to === email) note.read = true;
      });
    });
  }, [commit]);

  const value = useMemo<VaultContextValue>(
    () => ({
      ready,
      db,
      me,
      toastMessage,
      toast,
      login,
      signup,
      logout,
      attachAccount,
      updateProfile,
      changePassword,
      requestReset,
      verifyReset,
      finishReset,
      updateUser,
      createEnv,
      updateEnv,
      createProject,
      updateProject,
      deleteProject,
      deleteEnv,
      upsertVar,
      removeVar,
      importVars,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      invite,
      cancelInvite,
      respondInvite,
      removeMember,
      setMemberAccess,
      markInfoRead,
    }),
    [
      ready,
      db,
      me,
      toastMessage,
      toast,
      login,
      signup,
      logout,
      attachAccount,
      updateProfile,
      changePassword,
      requestReset,
      verifyReset,
      finishReset,
      updateUser,
      createEnv,
      updateEnv,
      createProject,
      updateProject,
      deleteProject,
      deleteEnv,
      upsertVar,
      removeVar,
      importVars,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      invite,
      cancelInvite,
      respondInvite,
      removeMember,
      setMemberAccess,
      markInfoRead,
    ],
  );

  return (
    <VaultContext.Provider value={value}>
      {children}
      {toastMessage ? (
        <div
          role="status"
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-max max-w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm text-white shadow-lg dark:bg-ink-100 dark:text-ink-950"
        >
          {toastMessage}
        </div>
      ) : null}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used within Providers");
  return context;
}
