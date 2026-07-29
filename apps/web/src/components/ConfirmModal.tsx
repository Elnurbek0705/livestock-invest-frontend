"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, X, Loader2 } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "success" | "warning";
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  type = "warning",
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Hook erta return'dan oldin chaqirilishi shart.
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const typeConfigs = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
      btnBg: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      btnBg: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30",
    },
    success: {
      icon: ShieldCheck,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
    },
  };

  const config = typeConfigs[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  {title}
                </h3>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 ${config.btnBg}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Bajarilmoqda...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
