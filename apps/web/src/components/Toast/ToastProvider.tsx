"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
    remove: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  useEffect(() => {
    const handleGlobalToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastItem>;
      const { type, message, title, duration } = customEvent.detail ?? {};

      if (type && message) {
        addToast(type, message, title, duration);
      }
    };

    window.addEventListener("livestock:toast", handleGlobalToast as EventListener);

    return () => {
      window.removeEventListener("livestock:toast", handleGlobalToast as EventListener);
    };
  }, [addToast]);

  const toastHelpers = {
    success: (message: string, title?: string, duration?: number) =>
      addToast("success", message, title, duration),
    error: (message: string, title?: string, duration?: number) =>
      addToast("error", message, title, duration),
    warning: (message: string, title?: string, duration?: number) =>
      addToast("warning", message, title, duration),
    info: (message: string, title?: string, duration?: number) =>
      addToast("info", message, title, duration),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}

      {/* Toast Container - Floating top-right */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const typeConfigs = {
    success: {
      bg: "bg-white dark:bg-zinc-900 border-emerald-500/40 text-emerald-950 dark:text-emerald-100",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      progressBg: "bg-emerald-500",
      defaultTitle: "Muvaffaqiyatli!",
    },
    error: {
      bg: "bg-white dark:bg-zinc-900 border-red-500/40 text-red-950 dark:text-red-100",
      icon: AlertCircle,
      iconColor: "text-red-600 dark:text-red-400",
      progressBg: "bg-red-500",
      defaultTitle: "Xatolik!",
    },
    warning: {
      bg: "bg-white dark:bg-zinc-900 border-amber-500/40 text-amber-950 dark:text-amber-100",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      progressBg: "bg-amber-500",
      defaultTitle: "Diqqat!",
    },
    info: {
      bg: "bg-white dark:bg-zinc-900 border-blue-500/40 text-blue-950 dark:text-blue-100",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      progressBg: "bg-blue-500",
      defaultTitle: "Ma'lumot",
    },
  };

  const config = typeConfigs[item.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 space-y-0.5 pr-2">
          <h4 className="text-xs font-bold tracking-tight">
            {item.title ?? config.defaultTitle}
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">
            {item.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Disappearance Timer Progress Bar */}
      {item.duration && item.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: item.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-1 ${config.progressBg}`}
        />
      )}
    </motion.div>
  );
}
