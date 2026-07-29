"use client";

/**
 * Kabinetlardagi barcha forma modallarining yagona qobig'i.
 *
 * Ilgari bu qobiq fermer modallari faylining ichida yopiq turardi va admin
 * kabineti o'zining alohida modalini yozgan edi — natijada ikkita boshqa-boshqa
 * modal (turli o'lcham, Escape ishlamaydi, scroll qulfi yo'q). Endi bitta joyda.
 */

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";

export function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // Modal faqat ochiq bo'lganda render qilinadi, shuning uchun qulf doimiy.
  useScrollLock(true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-zinc-900"
      >
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </motion.div>
    </div>
  );
}

export function ModalSubmitButton({
  isSubmitting,
  idleText,
  busyText,
}: {
  isSubmitting: boolean;
  idleText: string;
  busyText: string;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
    >
      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {isSubmitting ? busyText : idleText}
    </button>
  );
}
