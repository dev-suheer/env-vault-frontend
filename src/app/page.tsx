import type { Metadata } from "next";
import { AuthGate } from "@/modules/auth/components/auth-gate";
import { LoginScreen } from "@/modules/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function Home() {
  return (
    <AuthGate>
      <LoginScreen />
    </AuthGate>
  );
}
