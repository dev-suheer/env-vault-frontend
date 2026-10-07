"use client";

import { useSyncExternalStore } from "react";

const KEY = "envvault_reset";
const TTL = 10 * 60 * 1000;

export type ResetChallenge = {
  email: string;
  code: string;
  expires: number;
  verified: boolean;
  attempts: number;
  resetToken: string | null;
};

let snapshot: ResetChallenge | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): ResetChallenge | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as ResetChallenge;
    if (!value || typeof value.email !== "string" || typeof value.code !== "string" || typeof value.expires !== "number") return null;
    if (value.expires < Date.now()) return null;
    return { ...value, resetToken: typeof value.resetToken === "string" ? value.resetToken : null };
  } catch {
    return null;
  }
}

function load() {
  try {
    snapshot = parse(sessionStorage.getItem(KEY));
  } catch {
    snapshot = null;
  }
  hydrated = true;
}

function publish(next: ResetChallenge | null) {
  try {
    if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* the screen can still use the in-memory code for this tab */
  }
  snapshot = next;
  hydrated = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function clientChallenge() {
  if (!hydrated) load();
  return snapshot;
}

function clientReady() {
  if (!hydrated) load();
  return true;
}

export function useResetChallenge() {
  const challenge = useSyncExternalStore(subscribe, clientChallenge, () => null);
  const ready = useSyncExternalStore(subscribe, clientReady, () => false);
  return { ready, challenge };
}

export function currentReset() {
  if (!hydrated) load();
  if (snapshot && snapshot.expires < Date.now()) publish(null);
  return snapshot;
}

export function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function saveResetChallenge(email: string, code: string, expires = Date.now() + TTL) {
  publish({ email, code, expires, verified: false, attempts: 0, resetToken: null });
}

export function markResetVerified(resetToken: string | null = null) {
  if (!snapshot) return;
  publish({ ...snapshot, verified: true, resetToken });
}

export function noteResetAttempt() {
  if (!snapshot) return;
  publish({ ...snapshot, attempts: snapshot.attempts + 1 });
}

export function clearResetChallenge() {
  publish(null);
}
