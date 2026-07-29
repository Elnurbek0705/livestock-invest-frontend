/**
 * Boshqaruv panellari uchun umumiy qurilish bloklari.
 * Barcha kabinetlar (fermer, veterinar, admin) shulardan foydalanadi.
 *
 * Bu yerda ataylab `"use client"` yo'q: hech biri holat ham, hodisa
 * ishlovchisi ham ishlatmaydi. Direktiva turganda ular klient chegarasidan
 * o'tib qolardi va server sahifasi `icon={FileText}` kabi komponentni prop
 * sifatida uzata olmasdi ("Functions cannot be passed to Client Components").
 * Klient komponentlari ulardan avvalgidek foydalanaveradi.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// ============================================================
// Karta va sarlavhalar
// ============================================================

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-stone-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ============================================================
// Statistika kartochkasi (KPI)
// ============================================================

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Asosiy ko'rsatkich — biroz ajratib ko'rsatiladi */
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
          {label}
        </span>
        <Icon
          className={`h-4 w-4 shrink-0 ${
            accent ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400"
          }`}
        />
      </div>
      {/* Katta yakka son — proporsional raqamlar (tabular-nums faqat ustunlarda) */}
      <p className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  );
}

// ============================================================
// Holat nishoni
// ============================================================

/**
 * Rang faqat yordamchi kanal: ma'noni har doim matn tashiydi.
 * Shuning uchun matn neytral rangda qoladi, rang esa yonidagi nuqtada.
 */
export function StatusDot({ colorVar }: { colorVar: string }) {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: `var(${colorVar})` }}
    />
  );
}

export function StatusChip({
  label,
  colorVar,
  size = "md",
}: {
  label: string;
  colorVar: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-stone-200 bg-stone-50 font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-200 ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <StatusDot colorVar={colorVar} />
      {label}
    </span>
  );
}

// ============================================================
// Bo'sh holat va yuklanish
// ============================================================

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-11 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/60"
        />
      ))}
    </div>
  );
}

// ============================================================
// Forma maydonlari
// ============================================================

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-stone-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800";

/**
 * Panel ustidagi ixcham boshqaruv elementlari (qidiruv, filtr, saralash).
 *
 * `inputClass` dan farqi — bu yerda kenglik BERILMAGAN: elementlar bitta qatorga
 * tizilishi kerak. `inputClass` ichidagi `w-full` ni tashqaridan `w-auto` bilan
 * bosib bo'lmaydi — Tailwind'da klasslar tartibi emas, CSS'dagi joylashuvi hal
 * qiladi, shuning uchun alohida klass.
 */
export const controlClass =
  "rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white";
