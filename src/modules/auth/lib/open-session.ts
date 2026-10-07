"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { homePath } from "@/lib/permissions";
import { useVault } from "@/lib/store";
import type { AuthUser } from "@/store/Reducer/auth-api";
import { setUser } from "@/store/slice/userSlice";

export function useOpenSession() {
  const { attachAccount } = useVault();
  const dispatch = useDispatch();
  const router = useRouter();

  return (user: AuthUser, token: string) => {
    dispatch(setUser({ ...user, token }));
    attachAccount({
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      image: user.image,
      status: user.status,
    });
    router.replace(homePath(user.role));
  };
}
