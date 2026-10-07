import type { Metadata } from "next";
import { UserDetailPage } from "@/modules/users/components/user-detail";

export const metadata: Metadata = {
  title: "User",
};

export default function UserPage() {
  return <UserDetailPage />;
}
