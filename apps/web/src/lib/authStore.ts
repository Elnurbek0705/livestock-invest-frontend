"use client";

import { create } from "zustand";
import type { RegisterableRole, User } from "@livestock-invest/shared-types";
import { getApiClient, tokenStore } from "@livestock-invest/api-client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    phone: string;
    email?: string;
    role: RegisterableRole;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  loadCurrentUser: () => Promise<void>;
}

function emitAuthToast(type: "success" | "error" | "warning" | "info", message: string, title?: string, duration = 4000) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("livestock:toast", {
      detail: { type, message, title, duration },
    }),
  );
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  async login(phone, password) {
    set({ isLoading: true });
    try {
      const api = getApiClient();
      const { user } = await api.auth.login(phone, password);
      set({ user, isLoading: false });
      emitAuthToast("success", "Tizimga muvaffaqiyatli kirdingiz.", "Xush kelibsiz!", 3500);
    } catch (error) {
      set({ isLoading: false });
      emitAuthToast(
        "error",
        error instanceof Error ? error.message : "Tizimga kirishda xatolik yuz berdi.",
        "Kirishda xatolik",
        4500,
      );
      throw error;
    }
  },

  async register(input) {
    set({ isLoading: true });
    try {
      const api = getApiClient();
      const { user } = await api.auth.register(input);
      set({ user, isLoading: false });
      emitAuthToast("success", "Hisobingiz muvaffaqiyatli yaratildi.", "Ro'yxatdan o'tdingiz!", 3500);
    } catch (error) {
      set({ isLoading: false });
      emitAuthToast(
        "error",
        error instanceof Error ? error.message : "Ro'yxatdan o'tishda xatolik yuz berdi.",
        "Ro'yxatdan o'tishda xatolik",
        4500,
      );
      throw error;
    }
  },

  logout() {
    tokenStore.clear();
    set({ user: null });
    emitAuthToast("info", "Tizimdan chiqdingiz.", "Chiqildi", 2500);
  },

  async loadCurrentUser() {
    set({ isLoading: true });
    try {
      const api = getApiClient();
      const user = await api.auth.me();
      set({ user, isLoading: false, isInitialized: true });
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },
}));
