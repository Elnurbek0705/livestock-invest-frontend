"use client";

/**
 * Qism-butun taqsimoti — bitta gorizontal to'plamli ustun.
 *
 * Uchta bo'lak: bu yerda pirog (pie) emas, ustun ishlatiladi — yaqin
 * qiymatlarni ustunda taqqoslash osonroq. Bo'laklar 2px fon oralig'i bilan
 * ajratiladi (chegara chizig'i emas), qiymatlar esa izohlar ro'yxatida to'liq
 * yozilgan — ya'ni hech bir son faqat rang yoki tooltip ortida qolmaydi.
 *
 * Ranglar globals.css dagi `--chart-cat-*` tokenlaridan; ular dataviz
 * validatoridan ikkala rejimda ham o'tgan.
 */

import { useState } from "react";
import { formatUzs } from "@/lib/uz";

export interface SplitSegment {
  key: string;
  label: string;
  value: number;
  /** globals.css rang tokeni, masalan "--chart-cat-1" */
  colorVar: string;
}

export function SplitBar({
  segments,
  caption,
}: {
  segments: SplitSegment[];
  caption?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const visible = segments.filter((segment) => segment.value > 0);
  const total = visible.reduce((sum, segment) => sum + segment.value, 0);

  if (total === 0) {
    return (
      <p className="px-5 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        Taqsimotni ko'rsatish uchun hali yakunlangan sotuv yo'q.
      </p>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {caption && (
        <p className="text-xs text-stone-500 dark:text-stone-400">{caption}</p>
      )}

      <div
        className="flex h-6 w-full items-center gap-0.5"
        role="img"
        aria-label={visible
          .map(
            (segment) =>
              `${segment.label}: ${formatUzs(segment.value)}, ${Math.round((segment.value / total) * 100)}%`,
          )
          .join("; ")}
      >
        {visible.map((segment) => (
          <button
            key={segment.key}
            type="button"
            onPointerEnter={() => setActive(segment.key)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(segment.key)}
            onBlur={() => setActive(null)}
            aria-label={`${segment.label}: ${formatUzs(segment.value)}`}
            className="flex h-full min-w-1 items-center outline-none"
            style={{ width: `${(segment.value / total) * 100}%` }}
          >
            <span
              className={`block h-3 w-full rounded-full transition-opacity ${
                active && active !== segment.key ? "opacity-45" : "opacity-100"
              }`}
              style={{ backgroundColor: `var(${segment.colorVar})` }}
            />
          </button>
        ))}
      </div>

      {/* Izohlar ro'yxati bir vaqtning o'zida jadval vazifasini bajaradi:
          yorliq, aniq summa va ulush foizi — hammasi ochiq yozilgan. */}
      <ul className="space-y-1.5">
        {visible.map((segment) => (
          <li
            key={segment.key}
            onPointerEnter={() => setActive(segment.key)}
            onPointerLeave={() => setActive(null)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              active === segment.key ? "bg-stone-100 dark:bg-stone-800" : ""
            }`}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: `var(${segment.colorVar})` }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-stone-600 dark:text-stone-300">
              {segment.label}
            </span>
            <span className="text-xs tabular-nums text-stone-400">
              {Math.round((segment.value / total) * 100)}%
            </span>
            <span className="w-28 text-right text-xs font-semibold tabular-nums text-stone-900 dark:text-white">
              {formatUzs(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
