"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import type { User } from "@livestock-invest/shared-types";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export interface UseRequireAuthResult {
  user: User | null;
  state: AuthState;
}

/**
 * Himoyalangan sahifalar uchun avtorizatsiya hook'i.
 *
 * - `requireRole` berilmasa — faqat tizimga kirganligini tekshiradi.
 * - `requireRole` berilsa — foydalanuvchi roli mos kelmasa bosh sahifaga yo'naltiradi.
 *
 * Avval `loadCurrentUser()` bajarilib bitishini kutadi — shunda ilk yuklanishda
 * `user` null bo'lganda noto'g'ri yo'naltirish yoki token'siz so'rov oldini olinadi.
 */
export function useRequireAuth(requireRole?: User["role"]): UseRequireAuthResult {
  const router = useRouter();
  const { user, isInitialized, loadCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      loadCurrentUser();
    }
  }, [isInitialized, loadCurrentUser]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireRole && user.role !== requireRole) {
      router.replace("/");
    }
  }, [isInitialized, user, requireRole, router]);

  if (!isInitialized) {
    return { user: null, state: "loading" };
  }

  if (!user) {
    return { user: null, state: "unauthenticated" };
  }

  if (requireRole && user.role !== requireRole) {
    return { user: null, state: "loading" };
  }

  return { user, state: "authenticated" };
}
