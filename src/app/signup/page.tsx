import type { Metadata } from "next";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { SignupScreen } from "@/modules/auth/components/signup-screen";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthGate>
      <SignupScreen />
    </AuthGate>
  );
}
