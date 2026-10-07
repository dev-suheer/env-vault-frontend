"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Field, Form } from "@/components/hook-form";
import { card, mute, primary } from "@/lib/styles";
import { useChangePasswordMutation } from "@/store/Reducer/users-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";

const schema = z
  .object({
    current: z.string().min(1, { error: "Current password is required." }),
    next: z.string().min(6, { error: "New password must be at least 6 characters." }),
    confirm: z.string().min(1, { error: "Confirm new password is required." }),
  })
  .refine((data) => data.next === data.confirm, {
    path: ["confirm"],
    error: "New password and confirmation do not match.",
  })
  .refine((data) => data.next !== data.current, {
    path: ["next"],
    error: "New password must be different from the current one.",
  });

type PasswordValues = z.infer<typeof schema>;

export function ProfilePassword() {
  const [changePassword] = useChangePasswordMutation();
  const methods = useForm<PasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const next = useWatch({ control: methods.control, name: "next" });
  const current = useWatch({ control: methods.control, name: "current" });
  const confirm = useWatch({ control: methods.control, name: "confirm" });
  const longEnough = next.length >= 6;
  const matches = next.length > 0 && next === confirm;
  const different = next.length > 0 && next !== current;

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await changePassword({ current: data.current, next: data.next }).unwrap();
      methods.reset();
      showSuccess("Password updated");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit} className={`${card} mt-6 overflow-hidden`}>
      <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold">Change password</h2>
          <p className={`mt-1 text-xs ${mute}`}>Enter your current password, then choose a new one.</p>
          <div className="mt-5">
            <Field.Password name="current" label="Current password" autoComplete="current-password" />
            <Field.Password name="next" label="New password" autoComplete="new-password" />
            <Field.Password name="confirm" label="Confirm new password" autoComplete="new-password" />
          </div>
        </section>
        <section>
          <h2 className="text-sm font-bold">Requirements</h2>
          <ul className={`mt-3 space-y-2 text-sm ${mute}`}>
            <li className={longEnough ? "text-brand-700 dark:text-brand-500" : ""}>At least 6 characters</li>
            <li className={different ? "text-brand-700 dark:text-brand-500" : ""}>Different from the current password</li>
            <li className={matches ? "text-brand-700 dark:text-brand-500" : ""}>Confirmation matches the new password</li>
          </ul>
        </section>
      </div>
      <div className="flex justify-end border-t border-line px-5 py-4 sm:px-8 dark:border-ink-700">
        <button className={`${primary} disabled:cursor-not-allowed disabled:opacity-50`} disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? "Updating…" : "Update password"}
        </button>
      </div>
    </Form>
  );
}
