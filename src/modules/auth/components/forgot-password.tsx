"use client";

import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import {
  saveResetChallenge,
  useResetChallenge,
} from "@/modules/auth/lib/reset";
import { useForgotMutation } from "@/store/Reducer/auth-api";
import { getErrorMessage } from "@/utils/api";
import { showError } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required." })
    .email({ error: "Enter a valid email address." }),
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotPassword() {
  const [forgot] = useForgotMutation();
  const router = useRouter();

  const { challenge } = useResetChallenge();
  const methods = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: challenge?.email ?? "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const result = await forgot(data).unwrap();
      saveResetChallenge(result.email, result.code, result.expiresAt);
      router.push("/forgot/verify");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Forgot password</h2>
      <p className={`mt-1 text-sm ${mute}`}>
        Enter the email on your account. The next screen gives you a code to
        verify it.
      </p>
      <Form methods={methods} onSubmit={onSubmit} className="mt-6">
        <Field.Text
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoCapitalize="none"
        />
        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Sending…" : "Send code"}
        </button>
      </Form>
      {challenge && !challenge.verified ? (
        <Link
          href="/forgot/verify"
          className="mt-4 block text-sm font-semibold text-brand-700 dark:text-brand-500"
        >
          Continue with the code already sent
        </Link>
      ) : null}
      <Link href="/" className={`mt-4 block text-sm font-medium ${mute}`}>
        Back to sign in
      </Link>
    </AuthFrame>
  );
}
