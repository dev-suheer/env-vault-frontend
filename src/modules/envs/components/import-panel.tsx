"use client";

import { useRef } from "react";
import { btn, mute } from "@/lib/styles";

export function ImportPanel({ onImport }: { onImport: (text: string) => boolean | Promise<boolean> }) {
  const bulkRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="surface self-start rounded-xl border border-line bg-white p-5 lg:col-span-2 dark:border-ink-700 dark:bg-ink-900">
      <h2 className="text-sm font-bold">Import from .env</h2>
      <p className={`mt-1 text-xs ${mute}`}>Paste the whole file. Existing keys are updated, new keys are added.</p>
      <textarea
        ref={bulkRef}
        rows={9}
        placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=abc123"}
        className="mt-3 w-full rounded-lg border border-line px-3 py-2 font-mono text-base sm:text-xs dark:border-ink-650"
      />
      <div className="mt-3 flex flex-col gap-2 text-sm font-medium sm:flex-row">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-white hover:bg-slate-700 sm:py-2 dark:border dark:border-ink-650 dark:bg-ink-800 dark:hover:bg-ink-700"
          onClick={async () => {
            const field = bulkRef.current;
            if (!field) return;
            if (await onImport(field.value)) field.value = "";
          }}
        >
          Import variables
        </button>
        <label className={`${btn} cursor-pointer px-4 py-2.5 sm:py-2`}>
          Upload file
          <input
            type="file"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onImport(await file.text());
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
