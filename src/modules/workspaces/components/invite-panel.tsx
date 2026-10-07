"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Field, Form } from "@/components/hook-form";
import { card, mute, primary } from "@/lib/styles";
import { useVault } from "@/lib/store";
import { useInviteMemberMutation } from "@/store/Reducer/invites-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z.object({
  email: z.string().trim().min(1, { error: "Email is required." }).email({ error: "Enter a valid email address." }),
  access: z.enum(["view", "edit"], { error: "Choose view or edit access." }),
});

type InviteValues = z.infer<typeof schema>;

export function InvitePanel({ workspaceId, canManage }: { workspaceId: string; canManage: boolean }) {
  const { me } = useVault();
  const [inviteMember] = useInviteMemberMutation();
  const methods = useForm<InviteValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", access: "view" },
  });
  const access = useWatch({ control: methods.control, name: "access" });
  if (!me || !canManage) return null;

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await inviteMember({ workspaceId, email: values.email, access: values.access }).unwrap();
      methods.reset({ email: "", access: "view" });
      showSuccess(`Invite sent to ${values.email}`);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <div className={`${card} self-start p-5 lg:col-span-2`}>
      <h2 className="text-sm font-bold">Invite a dev</h2>
      <p className={`mt-1 text-xs ${mute}`}>They get a notification and join once they accept.</p>
      <Form methods={methods} onSubmit={onSubmit} className="mt-4">
        <Field.Text name="email" label="Dev email" type="email" placeholder="dev@company.com" autoCapitalize="none" />
        <Field.Select
          name="access"
          label="Access"
          options={[
            { value: "view", label: "View" },
            { value: "edit", label: "Edit" },
          ]}
          hint={access === "edit" ? "They can change env files in this workspace." : "They can open env files. They can change only the ones they create."}
        />
        <button disabled={methods.formState.isSubmitting} className={`${primary} mt-4 w-full sm:w-auto`}>
          {methods.formState.isSubmitting ? "Sending…" : "Send invite"}
        </button>
      </Form>
    </div>
  );
}
