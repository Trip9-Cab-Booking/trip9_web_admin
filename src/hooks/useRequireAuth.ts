"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectCurrentUser } from "@/store/authSlice";

export function useRequireAuth() {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
    }
  }, [user, router]);
}
