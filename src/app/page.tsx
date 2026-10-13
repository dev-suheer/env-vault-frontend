import type { Metadata } from "next";
import { LandingView } from "@/modules/landing/views/landing-view";

export const metadata: Metadata = {
  title: "SecureEnv",
  description:
    "Project managers set up workspaces, developers join by invite, and everyone shares the same env files without pasting secrets in chat.",
};

export default function Home() {
  return <LandingView />;
}
