"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { formatUzs } from "@/lib/uz";
import { SectionHeading, sectionClass } from "@/components/landing/SectionHeading";

/**
 * Foyda prognozi kalkulyatori.
 *
 * Koeffitsientlar — bozorning o'rtacha ko'rsatkichlari asosidagi taxmin, ular
 * hech qanday kafolat bermaydi. Shuning uchun natija bloki "prognoz" deb
 * belgilangan va ostida ogohlantirish turadi: huquqiy talab bo'yicha
 * investorga kafolatlangan daromad va'da qilinmaydi.
 */
const CYCLES = [
  { months: 4, label: "4 oy", rate: 0.22 },
  { months: 6, label: "6 oy", rate: 0.32 },
  { months: 8, label: "8 oy", rate: 0.42 },
];

/** Odatiy shartnomadagi investor ulushi; haqiqiy foiz har bir e'londa ko'rsatiladi. */
const INVESTOR_SHARE_PERCENT = 70;

export function RoiCalculator() {
  const [amountUzs, setAmountUzs] = useState(10_000_000);
  const [months, setMonths] = useState(6);

  const cycle = CYCLES.find((item) => item.months === months) ?? CYCLES[1];
  const grossProfit = Math.round(amountUzs * cycle.rate);
  const investorProfit = Math.round(grossProfit * (INVESTOR_SHARE_PERCENT / 100));
  const totalReturn = amountUzs + investorProfit;

  return (
    <section id="calculator" className={sectionClass}>
      <SectionHeading
        title="Foyda prognozi"
        subtitle="Summa va boqish muddatini tanlang"
      />

      <div className="grid gap-3 lg:grid-cols-5">
        {/* Boshqaruv */}
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-zinc-900 lg:col-span-3">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="roi-amount" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Sarmoya summasi
              </label>
              <span className="text-sm font-bold tabular-nums text-stone-900 dark:text-white">
                {formatUzs(amountUzs)}
              </span>
            </div>
            <input
              id="roi-amount"
              type="range"
              min={2_000_000}
              max={50_000_000}
              step={1_000_000}
              value={amountUzs}
              onChange={(event) => setAmountUzs(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-emerald-600 dark:bg-stone-700"
            />
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-stone-400">
              <span>2 mln</span>
              <span>50 mln</span>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Boqish muddati
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CYCLES.map((item) => (
                <button
                  key={item.months}
                  type="button"
                  onClick={() => setMonths(item.months)}
                  aria-pressed={months === item.months}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    months === item.months
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Natija */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30 lg:col-span-2">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-600 dark:text-stone-400">Sarmoya</dt>
              <dd className="font-medium tabular-nums text-stone-900 dark:text-white">
                {formatUzs(amountUzs)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-600 dark:text-stone-400">
                Sizning ulushingiz ({INVESTOR_SHARE_PERCENT}%)
              </dt>
              <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                +{formatUzs(investorProfit)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-emerald-200 pt-2.5 dark:border-emerald-900/60">
              <dt className="font-medium text-stone-700 dark:text-stone-300">
                Davr oxirida
              </dt>
              <dd className="text-lg font-bold tabular-nums text-stone-900 dark:text-white">
                {formatUzs(totalReturn)}
              </dd>
            </div>
          </dl>

          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Bozordan qo'zi tanlash
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Bu prognoz, kafolat emas. Yakuniy daromad qo'zining haqiqiy vazn o'sishiga va
        sotuv narxiga bog'liq; ulush foizi har bir e'londa alohida ko'rsatiladi.
      </p>
    </section>
  );
}
