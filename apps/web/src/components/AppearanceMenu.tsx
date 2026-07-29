"use client";

/**
 * Ko'rinish sozlamalari menyusi — mavzu va shrift o'lchami bitta joyda.
 */

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Settings2, Sun } from "lucide-react";
import {
  FONT_SCALES,
  useAppearance,
  type ThemePreference,
} from "@/components/ThemeProvider";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Tizim bo'yicha", icon: Monitor },
  { value: "light", label: "Yorug'", icon: Sun },
  { value: "dark", label: "Qorong'i", icon: Moon },
];

export function AppearanceMenu({ className = "" }: { className?: string }) {
  const { preference, resolved, fontScale, setPreference, setFontScale } =
    useAppearance();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tashqariga bosilsa yoki Escape bosilsa yopiladi.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const ActiveIcon = resolved === "dark" ? Moon : Sun;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Ko'rinish sozlamalari"
        title="Ko'rinish sozlamalari"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Ko'rinish sozlamalari"
          className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900"
        >
          <fieldset>
            <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <Settings2 className="h-3.5 w-3.5" /> Mavzu
            </legend>
            <div className="space-y-0.5">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = preference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPreference(option.value)}
                    aria-pressed={isActive}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{option.label}</span>
                    {isActive && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800">
            <legend className="mb-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
              Shrift o'lchami
            </legend>
            <div className="grid grid-cols-4 gap-1">
              {FONT_SCALES.map((step) => {
                const isActive = Math.abs(fontScale - step.value) < 0.001;
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => setFontScale(step.value)}
                    aria-pressed={isActive}
                    title={step.label}
                    className={`rounded-lg py-1.5 transition-colors ${
                      isActive
                        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                        : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                    }`}
                  >
                    {/* Har bir tugmadagi "A" o'sha o'lchamni ko'rsatadi —
                        yorliqni o'qimasdan ham farqi ko'rinadi. */}
                    <span style={{ fontSize: `${step.value * 0.85}rem` }}>A</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-400">
              Joriy: {FONT_SCALES.find((step) => Math.abs(fontScale - step.value) < 0.001)
                ?.label ?? "Odatiy"}
            </p>
          </fieldset>
        </div>
      )}
    </div>
  );
}
