"use client";

import { Form } from "@/components/hook-form";
import { mute } from "@/lib/styles";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import {
  markResetVerified,
  saveResetChallenge,
  useResetChallenge,
} from "@/modules/auth/lib/reset";
import {
  useForgotMutation,
  useVerifyResetMutation,
} from "@/store/Reducer/auth-api";
import { getErrorMessage } from "@/utils/api";
import { showError, showSuccess } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, { error: "Enter the full 6-digit code." }),
});

type VerifyValues = z.infer<typeof schema>;

export function VerifyCode() {
  const [verifyReset] = useVerifyResetMutation();
  const [forgot, { isLoading: resending }] = useForgotMutation();
  
  const router = useRouter();
  const { ready, challenge } = useResetChallenge();
  const methods = useForm<VerifyValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });
  const code = useWatch({ control: methods.control, name: "code" });

  useEffect(() => {
    if (!ready) return;
    if (!challenge) router.replace("/forgot");
    else if (challenge.verified) router.replace("/forgot/reset");
  }, [ready, challenge, router]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!challenge) return;
    try {
      const result = await verifyReset({
        email: challenge.email,
        code: data.code,
      }).unwrap();
      markResetVerified(result.resetToken);
      router.push("/forgot/reset");
    } catch (error) {
      showError(getErrorMessage(error));
    }
  });

  if (!ready || !challenge || challenge.verified)
    return <div className="min-h-dvh" />;

  return (
    <AuthFrame>
      <h2 className="text-2xl font-bold">Verify code</h2>
      <p className={`mt-1 text-sm ${mute}`}>
        Enter the 6-digit code for {challenge.email}.
      </p>
      <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-3 text-sm dark:border-ink-700 dark:bg-ink-950">
        <p className={mute}>
          This demo stays in the browser, so the code is shown here.
        </p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-[0.3em]">
          {challenge.code}
        </p>
      </div>
      <Form methods={methods} onSubmit={onSubmit} className="mt-6">
        <CodeBoxes
          value={code}
          onChange={(value) =>
            methods.setValue("code", value, {
              shouldValidate: methods.formState.isSubmitted,
            })
          }
        />
        {methods.formState.errors.code ? (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
            {methods.formState.errors.code.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="btn-p mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {methods.formState.isSubmitting ? "Checking…" : "Verify"}
        </button>
      </Form>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-500"
        disabled={resending}
        onClick={async () => {
          try {
            const result = await forgot({ email: challenge.email }).unwrap();
            saveResetChallenge(result.email, result.code, result.expiresAt);
            methods.reset({ code: "" });
            showSuccess("A new code is ready.");
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }}
      >
        Send a new code
      </button>
      <Link href="/forgot" className={`mt-3 block text-sm font-medium ${mute}`}>
        Use a different email
      </Link>
    </AuthFrame>
  );
}

function CodeBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function apply(next: string) {
    onChange(next.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={(event) => {
        event.preventDefault();
        apply(event.clipboardData.getData("text"));
      }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={digit}
          className="h-12 w-11 rounded-lg border border-line bg-white text-center font-mono text-lg dark:border-ink-650 dark:bg-ink-900"
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = digits.slice();
            chars[index] = nextDigit;
            apply(chars.join(""));
            if (nextDigit && index < 5) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0)
              refs.current[index - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
