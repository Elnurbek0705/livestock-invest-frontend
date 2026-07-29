"use client";

/**
 * Bosqichlar bo'yicha taqsimot — bitta gorizontal to'plamli ustun.
 *
 * Bo'laklar orasidagi ajratgich — 2px karta foni (chegara chizig'i emas).
 * Ranglar tartiblangan ramp bo'yicha: bosqich ilgarilagani sari to'qroq.
 * Ma'no har doim matnda ham bor (izohlar ro'yxati), rang yolg'iz qolmaydi.
 *
 * Komponent bosqichning o'zi nima ekanini bilmaydi: chorva holati ham,
 * escrow bosqichi ham shu yerga tayyor yorliq va rang bilan uzatiladi.
 */

export interface PipelineSlice {
  key: string;
  label: string;
  /** globals.css dagi rang tokeni, masalan "--stage-2" */
  colorVar: string;
  count: number;
}

import { StatusDot } from "./primitives";

export function PipelineBar({
  slices,
  activeKey,
  onSelect,
}: {
  slices: PipelineSlice[];
  /** Hozir tanlangan filtr — mos bo'lak ajratib ko'rsatiladi */
  activeKey?: string;
  onSelect?: (key: string) => void;
}) {
  const visible = slices.filter((slice) => slice.count > 0);
  const total = visible.reduce((sum, slice) => sum + slice.count, 0);

  if (total === 0) {
    return (
      <p className="px-5 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        Taqsimotni ko'rsatish uchun hali ma'lumot yo'q.
      </p>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {/* Ko'rinadigan ustun 12px, bosiladigan maydon esa 24px — ingichka
          bo'lakni ham barmoq/sichqoncha bilan bemalol tanlash uchun. */}
      <div className="flex h-6 w-full items-center gap-0.5">
        {visible.map((slice) => {
          const share = (slice.count / total) * 100;
          return (
            <button
              key={slice.key}
              type="button"
              onClick={() => onSelect?.(slice.key)}
              title={`${slice.label}: ${slice.count} ta (${Math.round(share)}%)`}
              aria-label={`${slice.label}: ${slice.count} ta`}
              className="group flex h-full min-w-1 items-center transition-opacity hover:opacity-80 disabled:cursor-default"
              disabled={!onSelect}
              style={{ width: `${share}%` }}
            >
              <span
                className="block h-3 w-full rounded-full"
                style={{ backgroundColor: `var(${slice.colorVar})` }}
              />
            </button>
          );
        })}
      </div>

      {/* Izohlar ro'yxati — ikkitadan ortiq bo'lak bo'lsa har doim mavjud */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {visible.map((slice) => {
          const isActive = activeKey === slice.key;
          return (
            <li key={slice.key}>
              <button
                type="button"
                onClick={() => onSelect?.(slice.key)}
                disabled={!onSelect}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors enabled:hover:bg-stone-100 dark:enabled:hover:bg-stone-800 ${
                  isActive ? "bg-stone-100 dark:bg-stone-800" : ""
                }`}
              >
                <StatusDot colorVar={slice.colorVar} />
                <span className="min-w-0 flex-1 truncate text-xs text-stone-600 dark:text-stone-300">
                  {slice.label}
                </span>
                <span className="text-xs font-semibold tabular-nums text-stone-900 dark:text-white">
                  {slice.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
