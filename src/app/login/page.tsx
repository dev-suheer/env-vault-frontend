import type { Metadata } from "next";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { LoginScreen } from "@/modules/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthGate>
      <LoginScreen />
    </AuthGate>
  );
}
