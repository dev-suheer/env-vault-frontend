"use client";

import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import {
  clearResetChallenge,
  useResetChallenge,
} from "@/modules/auth/lib/reset";
import { useFinishResetMutation } from "@/store/Reducer/auth-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    password: z
      .string()
      .min(6, { error: "New password must be at least 6 characters." }),
    confirm: z.string().min(1, { error: "Confirm password is required." }),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    error: "New password and confirmation do not match.",
  });

type ResetValues = z.infer<typeof schema>;

export function ResetPassword() {
  const [finishReset] = useFinishResetMutation();
  const router = useRouter();
  const { ready, challenge } = useResetChallenge();
  const [leaving, setLeaving] = useState(false);
  const methods = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    if (!ready || leaving) return;
    if (!challenge) router.replace("/forgot");
    else if (!challenge.verified) router.replace("/forgot/verify");
  }, [ready, challenge, leaving, router]);

  const onSubmit = methods.handleSubmit(async (data) => {
    const resetToken = challenge?.resetToken;
    if (!resetToken) {
      showError("Request a new code.");
      return;
    }
    try {
      await finishReset({ resetToken, password: data.password }).unwrap();
      setLeaving(true);
      clearResetChallenge();
      showSuccess("Password updated. Sign in with the new one.");
      router.replace("/");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  if (!ready || !challenge?.verified) return <div className="min-h-dvh" />;

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Reset password</h2>
      <p className={`mt-1 text-sm ${mute}`}>
        Choose a new password for {challenge.email}.
      </p>
      <Form methods={methods} onSubmit={onSubmit} className="mt-6">
        <Field.Password
          name="password"
          label="New password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        <Field.Password
          name="confirm"
          label="Confirm password"
          placeholder="Repeat the new password"
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Updating…" : "Update password"}
        </button>
      </Form>
      <Link href="/" className={`mt-4 block text-sm font-medium ${mute}`}>
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
