"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/brand/modal";
import { Field, Form } from "@/components/hook-form";
import { ROLE } from "@/lib/brand";
import { input, mute } from "@/lib/styles";
import { useVault } from "@/lib/store";
import type { AuthUser } from "@/store/Reducer/auth-api";
import { useUpdateUserMutation } from "@/store/Reducer/users-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(60, { error: "Use 60 characters or fewer." }),
  role: z.enum(["pm", "dev"], { error: "Choose a role." }),
  status: z.enum(["active", "inactive"], { error: "Choose a status." }),
});

type UserValues = z.infer<typeof schema>;

export function EditUserModal({ user, onClose }: { user: AuthUser | null; onClose: () => void }) {
  return (
    <Modal open={user !== null} onClose={onClose}>
      {user ? <UserForm key={user.email} user={user} onClose={onClose} /> : null}
    </Modal>
  );
}

function UserForm({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const { me } = useVault();
  const [updateUser] = useUpdateUserMutation();
  const self = me?.email === user.email;
  const locked = self || user.role === "admin";
  const methods = useForm<UserValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      role: user.role === "pm" ? "pm" : "dev",
      status: user.status ? "active" : "inactive",
    },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await updateUser({
        id: user.id,
        name: data.name,
        role: locked ? user.role : data.role,
        status: self ? true : data.status === "active",
      }).unwrap();
      onClose();
      showSuccess("User updated");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit} className="fade surface rounded-2xl border border-transparent bg-white p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900">
      <h3 className="text-lg font-bold">Edit user</h3>
      <p className={`mt-1 text-sm ${mute}`}>{user.email}</p>
      <div className="mt-4">
        <Field.Text name="name" label="Name" maxLength={60} />
        {locked ? (
          <label className="mt-4 block text-sm font-medium">
            Role
            <input value={ROLE[user.role].label} disabled className={`mt-1 ${input} cursor-not-allowed bg-canvas text-mute dark:bg-ink-950`} />
          </label>
        ) : (
          <Field.Select
            name="role"
            label="Role"
            options={[
              { value: "pm", label: "Project Manager" },
              { value: "dev", label: "Dev" },
            ]}
          />
        )}
        {self ? (
          <label className="mt-4 block text-sm font-medium">
            Status
            <input value={user.status ? "Active" : "Inactive"} disabled className={`mt-1 ${input} cursor-not-allowed bg-canvas text-mute dark:bg-ink-950`} />
          </label>
        ) : (
          <Field.Select
            name="status"
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        )}
      </div>
      <p className={`mt-3 text-xs ${mute}`}>
        {self
          ? "Your own role and status stay locked. There is only one admin."
          : "Roles are Project Manager or Dev. Admin stays a single account."}
      </p>
      <div className="mt-6 flex justify-end gap-2 text-sm">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-medium hover:bg-[#eff2f5] dark:hover:bg-ink-800">
          Cancel
        </button>
        <button
          disabled={methods.formState.isSubmitting}
          className="btn-p rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Form>
  );
}
