"use client";

/**
 * Tizimdan chiqish — har doim tasdiq so'raladi.
 *
 * Tugma ikki joyda: navbarda va profil sahifasida. Tasdiqlash mantiqi shu
 * yerda, bitta joyda turadi — aks holda biri tuzatilib, ikkinchisi eskiligicha
 * qolib ketadi (aynan shunday bo'lgan edi).
 *
 * Modalni chaqiruvchi joydan emas, shu komponentdan chiqaramiz. Diqqat:
 * navbarda `backdrop-blur` bor, u `position: fixed` bolalari uchun konteyner
 * yaratadi — shuning uchun tugma navbar ichida bo'lsa ham, modal `<header>`
 * dan tashqarida render qilinishi kerak (buni Navbar hal qiladi:
 * `renderModal={false}` bilan chaqiradi va modalni o'zi joylashtiradi).
 */

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { ConfirmModal } from "@/components/ConfirmModal";

export function useLogoutConfirm(redirectTo?: string) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  const modal = (
    <ConfirmModal
      isOpen={isOpen}
      type="warning"
      title="Tizimdan chiqasizmi?"
      description="Hisobingizdan chiqasiz. Qaytadan kirish uchun telefon raqamingiz va parolingiz kerak bo'ladi."
      confirmText="Ha, chiqaman"
      cancelText="Qolaman"
      onConfirm={() => {
        setIsOpen(false);
        logout();
        if (redirectTo) router.push(redirectTo);
      }}
      onCancel={() => setIsOpen(false)}
    />
  );

  return { open: () => setIsOpen(true), modal };
}

export function LogoutButton({
  className,
  children,
  redirectTo,
}: {
  className: string;
  children: ReactNode;
  /** Chiqqandan keyin qaysi sahifaga o'tiladi */
  redirectTo?: string;
}) {
  const { open, modal } = useLogoutConfirm(redirectTo);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Tizimdan chiqish"
        className={className}
      >
        {children}
      </button>
      {modal}
    </>
  );
}
