"use client";

/**
 * Bozorning jadval ko'rinishi.
 *
 * Kartochkalar 10 ta e'londa chiroyli, 100 tasida esa sahifa cheksiz uzayadi.
 * Ko'p e'lonni yonma-yon solishtirish uchun shu ko'rinish beriladi: bir xil
 * ustunlar, bir xil o'qish yo'nalishi, raqamlar o'ngga tekislangan.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDateShortUz, formatUzs } from "@/lib/uz";
import { ListingPhoto } from "./ListingPhoto";
import { farmLine, type ListingRow } from "./shared";

export function ListingTable({ rows }: { rows: ListingRow[] }) {
  return (
    <>
      {/* Katta ekran: to'liq jadval */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <th scope="col" className="px-4 py-2.5 font-medium">Qo'zi</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Ferma</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Vazn</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Yoshi</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Ulush</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Sotuv</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Narx</th>
              <th scope="col" className="px-4 py-2.5">
                <span className="sr-only">Ochish</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const title = row.breed ?? "Zoti ko'rsatilmagan";
              return (
                <tr
                  key={row.id}
                  className="group border-b border-stone-100 transition-colors last:border-0 hover:bg-stone-50 dark:border-stone-800/70 dark:hover:bg-stone-800/40"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <ListingPhoto url={row.photoUrls[0] ?? null} alt={title} />
                      </span>
                      <Link
                        href={`/marketplace/${row.id}`}
                        className="truncate font-medium text-stone-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                      >
                        {title}
                      </Link>
                    </div>
                  </td>
                  <td className="max-w-48 truncate px-4 py-2.5 text-stone-600 dark:text-stone-300">
                    {farmLine(row) ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                    {row.currentWeightKg} kg
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                    {row.ageMonths != null ? `${row.ageMonths} oy` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                    {row.offeredInvestorSharePercent}%
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-stone-600 dark:text-stone-300">
                    {formatDateShortUz(row.expectedSaleDate)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-stone-900 dark:text-white">
                    {formatUzs(row.priceUzs)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/marketplace/${row.id}`}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                    >
                      Ko'rish
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Kichik ekran: ixcham qatorlar */}
      <ul className="divide-y divide-stone-100 dark:divide-stone-800/70 md:hidden">
        {rows.map((row) => {
          const title = row.breed ?? "Zoti ko'rsatilmagan";
          const farm = farmLine(row);
          return (
            <li key={row.id}>
              <Link
                href={`/marketplace/${row.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40"
              >
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <ListingPhoto url={row.photoUrls[0] ?? null} alt={title} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900 dark:text-white">
                    {title}
                  </p>
                  {farm && (
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                      {farm}
                    </p>
                  )}
                  <p className="mt-1 flex flex-wrap gap-x-2 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                    <span>{row.currentWeightKg} kg</span>
                    <span aria-hidden>·</span>
                    <span>{row.offeredInvestorSharePercent}%</span>
                    <span aria-hidden>·</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-100">
                      {formatUzs(row.priceUzs)}
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
