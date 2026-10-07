"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/brand/modal";
import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { useCreateProjectMutation, useUpdateProjectMutation, type Project } from "@/store/Reducer/projects-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(60, { error: "Use 60 characters or fewer." }),
  desc: z.string().trim().max(120, { error: "Use 120 characters or fewer." }),
});

type ProjectValues = z.infer<typeof schema>;

export function NewProjectModal({
  open,
  onClose,
  workspaceId,
  workspaceName,
  project = null,
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
  project?: Project | null;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {open ? (
        <ProjectForm
          key={project?.id ?? "new"}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          project={project}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function ProjectForm({
  workspaceId,
  workspaceName,
  project,
  onClose,
}: {
  workspaceId: string;
  workspaceName?: string;
  project: Project | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const editing = Boolean(project);
  const methods = useForm<ProjectValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: project?.name ?? "", desc: project?.desc ?? "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (project) {
        await updateProject({ id: project.id, workspaceId, ...data }).unwrap();
        onClose();
        showSuccess("Project updated");
        return;
      }
      const created = await createProject({ workspaceId, ...data }).unwrap();
      onClose();
      showSuccess("Project created. Add an env next.");
      router.push(`/workspaces/${workspaceId}/projects/${created.id}`);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <Form
      methods={methods}
      onSubmit={onSubmit}
      className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
    >
      <h3 className="text-lg font-bold">{editing ? "Edit project" : "New project"}</h3>
      <p className={`mt-1 text-sm ${mute}`}>
        {editing
          ? "Update the name and description. Env files in this project stay as they are."
          : workspaceName
            ? `Inside ${workspaceName}. Env files for this product live here.`
            : "Env files for this product live here."}
      </p>
      <div className="mt-4">
        <Field.Text name="name" label="Project name" maxLength={60} placeholder="e.g. Payments API" />
        <Field.Text name="desc" label="Description" maxLength={120} placeholder="What this project is for" />
      </div>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button
          disabled={methods.formState.isSubmitting}
          className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create project"}
        </button>
      </div>
    </Form>
  );
}
