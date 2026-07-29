"use client";

/**
 * Qo'zilarning vazn dinamikasi — kichik panellar to'plami (small multiples).
 *
 * Nega bitta ko'p chiziqli diagramma emas: har bir qo'zi alohida seriya bo'lsa,
 * beshtadan oshganda ranglar bir-biriga qo'shilib ketadi va rang ko'rish
 * buzilishida umuman ajralmaydi. Panellarga bo'lganda har birida bitta seriya
 * qoladi — rang bitta, izohlar ro'yxati (legend) kerak emas, taqqoslash esa
 * umumiy y o'qi orqali saqlanadi.
 *
 * Har bir nuqta sichqoncha va klaviatura bilan o'qiladi; ostidagi jadval esa
 * hech qanday ko'rsatkichsiz ham barcha qiymatlarni beradi — tooltip
 * ma'lumotning yagona manbai emas.
 */

import { useState } from "react";
import { formatMonthUz } from "@/lib/uz";

export interface WeightPanel {
  id: string;
  title: string;
  subtitle?: string;
  /** Har bir oy uchun bitta nuqta — takrorlangan oy chizmani buzadi */
  points: { month: string; weightKg: number }[];
}

const W = 280;
const H = 96;
/**
 * O'ng chekka oxirgi qiymat yorlig'i uchun ajratilgan: "142 kg" 11 birlikli
 * shriftda ~36 birlik joy egallaydi, oxirgi nuqta esa radiusi bilan birga
 * 235-birlikda tugaydi — ya'ni yorliq bilan nuqta ustma-ust tushmaydi.
 */
const PAD = { top: 14, right: 50, bottom: 18, left: 6 };

export function WeightTrendChart({ panels }: { panels: WeightPanel[] }) {
  const withData = panels.filter((panel) => panel.points.length > 0);

  if (withData.length === 0) return null;

  // Umumiy y oralig'i — panellarni bir-biriga taqqoslab bo'lishi uchun.
  const allWeights = withData.flatMap((panel) =>
    panel.points.map((point) => point.weightKg),
  );
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  const domain = min === max ? { min: min - 1, max: max + 1 } : { min, max };

  const allMonths = [
    ...new Set(withData.flatMap((panel) => panel.points.map((p) => p.month))),
  ].sort();

  return (
    <div className="space-y-4 p-5">
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Barcha panellar bitta o'lchovda:{" "}
        <span className="tabular-nums">
          {Math.round(domain.min)}–{Math.round(domain.max)} kg
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {withData.map((panel) => (
          <Panel key={panel.id} panel={panel} domain={domain} />
        ))}
      </div>

      <details className="group">
        <summary className="cursor-pointer text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
          Jadval ko'rinishi
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                <th scope="col" className="py-2 pr-4 font-medium">Qo'zi</th>
                {allMonths.map((month) => (
                  <th key={month} scope="col" className="py-2 pr-4 text-right font-medium">
                    {formatMonthUz(month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withData.map((panel) => (
                <tr
                  key={panel.id}
                  className="border-b border-stone-100 last:border-0 dark:border-stone-800/70"
                >
                  <th
                    scope="row"
                    className="py-2 pr-4 text-left font-medium text-stone-800 dark:text-stone-100"
                  >
                    {panel.title}
                  </th>
                  {allMonths.map((month) => {
                    const point = panel.points.find((item) => item.month === month);
                    return (
                      <td
                        key={month}
                        className="py-2 pr-4 text-right tabular-nums text-stone-600 dark:text-stone-300"
                      >
                        {point ? `${point.weightKg} kg` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Panel({
  panel,
  domain,
}: {
  panel: WeightPanel;
  domain: { min: number; max: number };
}) {
  const [active, setActive] = useState<number | null>(null);

  const points = [...panel.points].sort((a, b) => a.month.localeCompare(b.month));
  const count = points.length;

  const plotWidth = W - PAD.left - PAD.right;
  const plotHeight = H - PAD.top - PAD.bottom;

  const x = (index: number) =>
    count === 1 ? PAD.left + plotWidth / 2 : PAD.left + (index / (count - 1)) * plotWidth;
  const y = (value: number) =>
    PAD.top +
    (1 - (value - domain.min) / (domain.max - domain.min)) * plotHeight;

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(point.weightKg)}`)
    .join(" ");

  const last = points[count - 1];
  const first = points[0];
  const activePoint = active != null ? points[active] : null;

  return (
    <figure className="relative rounded-xl border border-stone-200 p-3 dark:border-stone-800">
      <figcaption className="mb-1">
        <p className="truncate text-xs font-semibold text-stone-900 dark:text-white">
          {panel.title}
        </p>
        {panel.subtitle && (
          <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
            {panel.subtitle}
          </p>
        )}
      </figcaption>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${panel.title}: vazn ${first.weightKg} kg dan ${last.weightKg} kg gacha`}
        >
          {/* Tayanch chizig'i — bir qadam fondan farq qiladigan yupqa to'liq chiziq */}
          <line
            x1={PAD.left}
            y1={H - PAD.bottom}
            x2={W - PAD.right}
            y2={H - PAD.bottom}
            stroke="var(--chart-grid)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />

          {count > 1 && (
            <path
              d={path}
              fill="none"
              stroke="var(--chart-series)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {points.map((point, index) => (
            <circle
              key={`${point.month}-${index}`}
              cx={x(index)}
              cy={y(point.weightKg)}
              r={active === index ? 5 : 4}
              fill="var(--chart-series)"
              stroke="var(--chart-surface)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Oxirgi qiymat — yagona to'g'ridan-to'g'ri yorliq. O'ngga tekislangan:
              uzun son ham viewBox chetidan chiqib ketmaydi (qirqilish o'rniga
              o'lchamni oldindan kafolatlaymiz). */}
          <text
            x={count === 1 ? x(0) + 10 : W - 2}
            y={y(last.weightKg) + 4}
            textAnchor={count === 1 ? "start" : "end"}
            className="fill-stone-600 text-[11px] tabular-nums dark:fill-stone-300"
          >
            {last.weightKg} kg
          </text>

          {/* Ushlash maydonchalari nuqtadan kengroq — 8px nuqtani aniq bosish qiyin */}
          {points.map((point, index) => {
            const band = count === 1 ? plotWidth : plotWidth / (count - 1);
            return (
              <rect
                key={`${point.month}-${index}`}
                x={x(index) - band / 2}
                y={0}
                width={band}
                height={H - PAD.bottom}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${formatMonthUz(point.month)}: ${point.weightKg} kg`}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
            );
          })}
        </svg>

        {/* Tooltip faqat chizma ustida turadi — sarlavhani yopib qo'ymaydi.
            Qiymat oldinda, oy esa ikkinchi darajali: bu yerda o'quvchida
            qatorning o'zi bor, unga son kerak. */}
        {activePoint && (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-0 top-0 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs shadow-lg dark:border-stone-700 dark:bg-stone-800"
          >
            <span className="font-semibold tabular-nums text-stone-900 dark:text-white">
              {activePoint.weightKg} kg
            </span>{" "}
            <span className="text-stone-500 dark:text-stone-400">
              · {formatMonthUz(activePoint.month)}
            </span>
          </div>
        )}
      </div>

      <p className="mt-1 flex justify-between text-[11px] text-stone-400">
        <span>{formatMonthUz(first.month)}</span>
        {count > 1 && <span>{formatMonthUz(last.month)}</span>}
      </p>
    </figure>
  );
}
