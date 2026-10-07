"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/brand/modal";
import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { useCreateWorkspaceMutation, useUpdateWorkspaceMutation } from "@/store/Reducer/workspaces-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(60, { error: "Use 60 characters or fewer." }),
  desc: z.string().trim().max(120, { error: "Use 120 characters or fewer." }),
});

type WorkspaceValues = z.infer<typeof schema>;

export function NewWorkspaceModal({
  open,
  onClose,
  workspace = null,
}: {
  open: boolean;
  onClose: () => void;
  workspace?: { id: string; name: string; desc: string } | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? <WorkspaceForm key={workspace?.id ?? "new"} workspace={workspace} onClose={onClose} /> : null}
    </Modal>
  );
}

function WorkspaceForm({
  workspace,
  onClose,
}: {
  workspace: { id: string; name: string; desc: string } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const editing = Boolean(workspace);
  const methods = useForm<WorkspaceValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: workspace?.name ?? "", desc: workspace?.desc ?? "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (workspace) {
        await updateWorkspace({ id: workspace.id, ...data }).unwrap();
        onClose();
        showSuccess("Workspace updated");
        return;
      }
      const created = await createWorkspace(data).unwrap();
      onClose();
      showSuccess("Workspace created. Add a project next.");
      router.push(`/workspaces/${created.id}`);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <Form
      methods={methods}
      onSubmit={onSubmit}
      className="fade surface max-h-[85dvh] overflow-y-auto rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
    >
      <h3 className="text-lg font-bold">{editing ? "Edit workspace" : "New workspace"}</h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing
          ? "Update the name and description. Members and projects stay as they are."
          : "A shared space for one team. Add a project next, then keep env files inside that project."}
      </p>
      <div className="mt-4">
        <Field.Text name="name" label="Workspace name" maxLength={60} placeholder="e.g. Plesi Platform" />
        <Field.Text name="desc" label="Description" maxLength={120} placeholder="What this workspace is for" />
      </div>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button
          disabled={methods.formState.isSubmitting}
          className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create workspace"}
        </button>
      </div>
    </Form>
  );
}
