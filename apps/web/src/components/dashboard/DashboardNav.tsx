"use client";

/**
 * Kabinetlarning yon menyusi — fermer, admin va investor uchun bitta komponent.
 *
 * Katta ekranda chapda yopishib turadi, kichik ekranda gorizontal lentaga
 * aylanadi.
 *
 * Faol bo'lim to'ldirilgan yashil fon bilan belgilanadi. Ilgari bu yerda
 * `bg-emerald-50` turardi: yorug' mavzuda u sahifa foni (`stone-50`) bilan
 * deyarli qo'shilib ketardi va qaysi bo'lim ochiqligi bilinmasdi. Oq matn
 * `emerald-700` ustida 5.5:1 kontrast beradi — WCAG AA dan yuqori.
 */

import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem<K extends string> {
  key: K;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function DashboardNav<K extends string>({
  items,
  active,
  onSelect,
}: {
  items: DashboardNavItem<K>[];
  active: K;
  onSelect: (key: K) => void;
}) {
  return (
    <nav
      aria-label="Kabinet bo'limlari"
      className="mb-5 flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:mb-0 lg:h-fit lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors lg:w-full ${
              isActive
                ? "bg-emerald-700 font-semibold text-white"
                : "font-medium text-stone-600 hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
