"use client";

/**
 * Bozor kartochkasi.
 *
 * Ilgari har bir kartochkada "Escrow Himoyalangan" nishoni, to'rtta
 * "yorliq: qiymat" qatori va "Investitsiya Narxi" sarlavhasi takrorlanardi —
 * bir xil matn 20 marta. Endi kartochkada faqat shu qo'ziga xos ma'lumot
 * qoladi: surat, zot, ferma, uchta o'lchov va narx. Escrow haqidagi ogohlik
 * sahifa sarlavhasida bir marta aytiladi.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDateShortUz, formatUzs } from "@/lib/uz";
import { ListingPhoto } from "./ListingPhoto";
import { farmLine, type ListingRow } from "./shared";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-2 py-2 text-center dark:bg-zinc-900">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums text-stone-800 dark:text-stone-100">
        {value}
      </dd>
    </div>
  );
}

export function ListingCard({ row }: { row: ListingRow }) {
  const title = row.breed ?? "Zoti ko'rsatilmagan";
  const farm = farmLine(row);

  return (
    <Link
      href={`/marketplace/${row.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-emerald-500/70 dark:border-stone-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <ListingPhoto
          url={row.photoUrls[0] ?? null}
          alt={title}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-stone-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Investor ulushi {row.offeredInvestorSharePercent}%
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-sm font-semibold text-stone-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
          {title}
        </h3>
        <p className="mt-0.5 h-4 truncate text-xs text-stone-500 dark:text-stone-400">
          {farm ?? ""}
        </p>

        <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800">
          <Metric label="Vazn" value={`${row.currentWeightKg} kg`} />
          <Metric
            label="Yoshi"
            value={row.ageMonths != null ? `${row.ageMonths} oylik` : "—"}
          />
          <Metric label="Sotuv" value={formatDateShortUz(row.expectedSaleDate)} />
        </dl>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
          <span className="text-base font-bold tabular-nums text-stone-900 dark:text-white">
            {formatUzs(row.priceUzs)}
          </span>
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-stone-800 dark:text-stone-400"
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
