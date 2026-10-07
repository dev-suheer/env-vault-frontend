"use client";

import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { useOpenSession } from "@/modules/auth/lib/open-session";
import { useLoginMutation } from "@/store/Reducer/auth-api";
import { getErrorMessage } from "@/utils/api";
import { showError } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Email is required." })
    .email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

type LoginValues = z.infer<typeof schema>;

export function LoginScreen() {
  const openSession = useOpenSession();
  const [login] = useLoginMutation();

  const methods = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const result = await login(data).unwrap();
      openSession(result.user, result.token);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <AuthFrame>
      <Form methods={methods} onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold">Sign in</h2>
        <p className={`mt-1 text-sm ${mute}`}>Welcome back.</p>
        <div className="mt-5">
          <Field.Text
            name="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            autoCapitalize="none"
          />
          <Field.Password
            name="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div className="mt-3 text-right">
          <Link
            href="/forgot"
            className="text-sm font-semibold text-brand-700 dark:text-brand-500"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Please wait…" : "Sign in"}
        </button>
      </Form>
      <p className={`mt-4 text-sm ${mute}`}>
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 dark:text-brand-500"
        >
          Sign up
        </Link>
      </p>
    </AuthFrame>
  );
}
