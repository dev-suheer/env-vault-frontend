"use client";

import { mute } from "@/lib/styles";
import { ProfileDetails } from "@/modules/profile/components/profile-details";
import { ProfilePassword } from "@/modules/profile/components/profile-password";
import { useState } from "react";

const TABS = [
  ["details", "Details"],
  ["password", "Password"],
] as const;

export function ProfilePage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("details");

  return (
    <div className="fade">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <p className={`mt-1 text-sm ${mute}`}>
        Update your photo, name, and phone, or change your password. Email and
        role cannot be changed.
      </p>
      <div className="tab-scroll mt-6 flex gap-1 border-b border-line text-sm font-semibold dark:border-ink-700">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2 ${tab === key ? "border-brand-500 text-fg dark:text-ink-100" : "border-transparent text-mute hover:text-fg dark:text-ink-400 dark:hover:text-ink-100"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "details" ? <ProfileDetails /> : <ProfilePassword />}
    </div>
  );
}
