import type { Metadata } from "next";
import { UserEnvsPage } from "@/modules/users/components/user-envs";

export const metadata: Metadata = {
  title: "Env files",
};

export default function UserEnvsRoute() {
  return <UserEnvsPage />;
}
