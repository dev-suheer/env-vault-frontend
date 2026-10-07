"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/brand/modal";
import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import {
  useCreatePersonalEnvMutation,
  useCreateProjectEnvMutation,
  useUpdateEnvMutation,
  type EnvFile,
  type EnvKind,
} from "@/store/Reducer/envs-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(60, { error: "Use 60 characters or fewer." }),
  desc: z.string().trim().max(120, { error: "Use 120 characters or fewer." }),
  env: z.enum(["Development", "Staging", "Production"], { error: "Choose an environment." }),
});

type EnvValues = z.infer<typeof schema>;

const ENVIRONMENTS = [
  { value: "Development", label: "Development" },
  { value: "Staging", label: "Staging" },
  { value: "Production", label: "Production" },
];

export function NewEnvModal({
  open,
  onClose,
  projectId,
  existing = null,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string | null;
  existing?: EnvFile | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? <EnvForm key={existing?.id ?? "new"} projectId={projectId} existing={existing} onClose={onClose} /> : null}
    </Modal>
  );
}

function EnvForm({ projectId, existing, onClose }: { projectId: string | null; existing: EnvFile | null; onClose: () => void }) {
  const router = useRouter();
  const [createPersonal] = useCreatePersonalEnvMutation();
  const [createProject] = useCreateProjectEnvMutation();
  const [updateEnv] = useUpdateEnvMutation();
  const editing = Boolean(existing);
  const methods = useForm<EnvValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing?.name ?? "",
      desc: existing?.desc ?? "",
      env: (existing?.env ?? "Development") as EnvKind,
    },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (existing) {
        await updateEnv({ id: existing.id, ...data }).unwrap();
        onClose();
        showSuccess("Env updated");
        return;
      }
      const created = projectId
        ? await createProject({ projectId, ...data }).unwrap()
        : await createPersonal(data).unwrap();
      onClose();
      showSuccess("Env created");
      router.push(`/envs/${created.id}`);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit} className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900">
      <h3 className="text-lg font-bold">{editing ? "Edit env" : "New env"}</h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing
          ? "Update the name, description, and environment. Variables stay as they are."
          : projectId
            ? "This env belongs to the project. You can edit it, and so can anyone given edit access."
            : "Personal env. Only you can see it."}
      </p>
      <div className="mt-4">
        <Field.Text name="name" label="Name" maxLength={60} placeholder="e.g. Payments API" />
        <Field.Text name="desc" label="Description" maxLength={120} placeholder="Repo link or a short note" />
        <Field.Select name="env" label="Environment" options={ENVIRONMENTS} />
      </div>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button
          disabled={methods.formState.isSubmitting}
          className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create env"}
        </button>
      </div>
    </Form>
  );
}
