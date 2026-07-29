import Link from "next/link";
import { Activity, ArrowRight, Calculator, Scale, ShieldCheck } from "lucide-react";
import { formatUzsCompact } from "@/lib/uz";

export interface MarketStats {
  count: number;
  minPrice: number;
  minShare: number;
  maxShare: number;
}

/**
 * Bosh ekran.
 *
 * Ilgari o'ng ustunda "chorva o'sish simulyatori" turardi: kg narxi kodda
 * qattiq yozilgan (85 000 so'm/kg) o'ylab topilgan hisob-kitob, ustiga
 * sahifaning o'zida `#calculator` bo'limida yana bitta kalkulyator bor edi.
 * Bitta kalkulyator yetarli, shuning uchun bu yerda uning o'rniga bozorning
 * haqiqiy holati ko'rsatiladi.
 */
export function HeroSection({ stats }: { stats: MarketStats | null }) {
  const shareRange =
    stats == null
      ? "—"
      : stats.minShare === stats.maxShare
        ? `${stats.maxShare}%`
        : `${stats.minShare}–${stats.maxShare}%`;

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-900 dark:text-white sm:text-4xl lg:text-5xl">
          Zotdor qo'zilarga sarmoya kiriting —{" "}
          <span className="text-emerald-700 dark:text-emerald-400">
            daromad vazn o'sishidan
          </span>
        </h1>
        <p className="max-w-xl text-base text-stone-600 dark:text-stone-300">
          Siz qo'zi sotib olasiz, tasdiqlangan ferma uni boqadi. Har oylik vazn va
          veterinar hisoboti kabinetingizda ko'rinib turadi.
        </p>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
          >
            Bozordagi qo'zilar
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#calculator"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <Calculator className="h-4 w-4 text-emerald-600" />
            Foydani hisoblash
          </a>
        </div>
      </div>

      {/* Bozorning joriy holati — o'ylab topilgan raqamlar emas, backend'dagi e'lonlar */}
      <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {[
          { label: "Ochiq e'lonlar", value: stats ? String(stats.count) : "—" },
          {
            label: "Eng past sarmoya",
            value: stats ? formatUzsCompact(stats.minPrice) : "—",
          },
          { label: "Investor ulushi", value: shareRange },
        ].map((cell) => (
          <div key={cell.label} className="bg-white px-4 py-3.5 dark:bg-zinc-900">
            <dt className="text-xs text-stone-500 dark:text-stone-400">{cell.label}</dt>
            <dd className="mt-0.5 text-lg font-bold tabular-nums text-stone-900 dark:text-white sm:text-xl">
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
        {[
          { icon: ShieldCheck, text: "Escrow kafolat hisobi" },
          { icon: Scale, text: "Oylik vazn hisoboti" },
          { icon: Activity, text: "Veterinar nazorati" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-emerald-600" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
