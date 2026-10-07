"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field, Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { useOpenSession } from "@/modules/auth/lib/open-session";
import { useSignupMutation } from "@/store/Reducer/auth-api";
import { getErrorMessage } from "@/utils/api";
import { showError } from "@/utils/toast";

const ROLES = [
  { value: "pm", label: "Project Manager" },
  { value: "dev", label: "Developer" },
] as const;

const schema = z.object({
  name: z.string().trim().min(1, { error: "Full name is required." }),
  email: z.string().trim().min(1, { error: "Email is required." }).email({ error: "Enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .min(1, { error: "Phone number is required." })
    .max(80, { error: "Use 80 characters or fewer." })
    .regex(/^[+]?[\d\s()-]{7,}$/, { error: "Enter a valid phone number." }),
  password: z.string().min(6, { error: "Password must be at least 6 characters." }),
  role: z.enum(["pm", "dev"], { error: "Choose a role." }),
});

type SignupValues = z.infer<typeof schema>;

export function SignupScreen() {
  const openSession = useOpenSession();
  const [signup] = useSignupMutation();
  const methods = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", role: "" as SignupValues["role"] },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const result = await signup(data).unwrap();
      openSession(result.user, result.token);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  return (
    <AuthFrame>
      <Form methods={methods} onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className={`mt-1 text-sm ${mute}`}>Tell us who you are, then choose how you will use EnvVault.</p>
        <div className="mt-5">
          <Field.Text name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" />
          <Field.Text name="email" label="Email" type="email" placeholder="you@company.com" autoComplete="email" autoCapitalize="none" />
          <Field.Text name="phone" label="Phone number" type="tel" placeholder="+92 300 1234567" autoComplete="tel" />
          <Field.Password name="password" label="Password" placeholder="At least 6 characters" autoComplete="new-password" />
          <Field.Select name="role" label="Role" placeholder="Select a role" options={[...ROLES]} />
        </div>
        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Please wait…" : "Create account"}
        </button>
      </Form>
      <p className={`mt-4 text-sm ${mute}`}>
        Already have an account?{" "}
        <Link href="/" className="font-semibold text-brand-700 dark:text-brand-500">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
