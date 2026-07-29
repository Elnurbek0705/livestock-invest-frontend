"use client";

/**
 * Qo'zilar ro'yxati — kartochkalar to'plami emas, boshqariladigan jadval.
 *
 * Kartochkalar 5 ta qo'zida ishlaydi, 100 tasida esa sahifa cheksiz uzayib
 * ketadi. Shuning uchun bu yerda qidiruv, filtr, saralash va sahifalash bor,
 * ekranda esa har doim faqat bitta sahifa qatorlari turadi.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Sprout, X } from "lucide-react";
import type { Farm, Livestock, LivestockStatus } from "@livestock-invest/shared-types";
import {
  LIVESTOCK_PIPELINE,
  LIVESTOCK_STATUS,
  formatDateUz,
  formatUzs,
  shortId,
} from "@/lib/uz";
import { EmptyState, StatusChip, controlClass } from "@/components/dashboard/primitives";

export type SortKey =
  | "newest"
  | "stage"
  | "priceDesc"
  | "priceAsc"
  | "weightDesc"
  | "saleDate";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Avval yangilari",
  stage: "Bosqich bo'yicha",
  priceDesc: "Narx: qimmatdan arzonga",
  priceAsc: "Narx: arzondan qimmatga",
  weightDesc: "Vazn: og'irdan yengilga",
  saleDate: "Sotuv sanasi yaqinlari",
};

export interface TableFilters {
  query: string;
  status: LivestockStatus | "all";
  farmId: string | "all";
  sort: SortKey;
}

export const EMPTY_FILTERS: TableFilters = {
  query: "",
  status: "all",
  farmId: "all",
  sort: "newest",
};

export function LivestockTable({
  items,
  farms,
  filters,
  onFiltersChange,
  onOpen,
  emptyAction,
}: {
  items: Livestock[];
  farms: Farm[];
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  onOpen: (item: Livestock) => void;
  emptyAction?: React.ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const farmNameById = useMemo(
    () => new Map(farms.map((farm) => [farm.id, farm.name])),
    [farms],
  );

  const visible = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.farmId !== "all" && item.farmId !== filters.farmId) return false;
      if (!query) return true;
      const haystack = [
        item.breed ?? "",
        farmNameById.get(item.farmId) ?? "",
        shortId(item.id),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (filters.sort) {
        case "stage":
          return (
            LIVESTOCK_PIPELINE.indexOf(a.status) - LIVESTOCK_PIPELINE.indexOf(b.status)
          );
        case "priceDesc":
          return b.priceUzs - a.priceUzs;
        case "priceAsc":
          return a.priceUzs - b.priceUzs;
        case "weightDesc":
          return b.currentWeightKg - a.currentWeightKg;
        case "saleDate":
          return a.expectedSaleDate.localeCompare(b.expectedSaleDate);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return sorted;
  }, [items, filters, farmNameById]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Filtr o'zgarsa har doim birinchi sahifaga qaytamiz, aks holda foydalanuvchi
  // bo'sh sahifada qolib ketadi.
  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const hasActiveFilter =
    filters.query !== "" || filters.status !== "all" || filters.farmId !== "all";

  const update = (patch: Partial<TableFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <div>
      {/* Boshqaruv paneli — qidiruv va uchala filtr bitta qatorda. Tor ekranda
          o'rni yetmasa o'zi keyingi qatorga o'tadi. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 dark:border-stone-800">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Zot, ferma yoki raqam bo'yicha qidirish"
            aria-label="Qo'zilar orasidan qidirish"
            className={`${controlClass} w-full pl-9`}
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) =>
            update({ status: event.target.value as TableFilters["status"] })
          }
          aria-label="Holat bo'yicha filtr"
          className={controlClass}
        >
          <option value="all">Barcha holatlar</option>
          {(Object.keys(LIVESTOCK_STATUS) as LivestockStatus[]).map((status) => (
            <option key={status} value={status}>
              {LIVESTOCK_STATUS[status].label}
            </option>
          ))}
        </select>

        {farms.length > 1 && (
          <select
            value={filters.farmId}
            onChange={(event) => update({ farmId: event.target.value })}
            aria-label="Ferma bo'yicha filtr"
            className={`${controlClass} max-w-48`}
          >
            <option value="all">Barcha fermalar</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value as SortKey })}
          aria-label="Saralash"
          className={controlClass}
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => onFiltersChange({ ...EMPTY_FILTERS, sort: filters.sort })}
            className="ml-auto inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Tozalash
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title={hasActiveFilter ? "Mos qo'zi topilmadi" : "Hozircha qo'zilar yo'q"}
          description={
            hasActiveFilter
              ? "Tanlangan filtrlarga mos yozuv yo'q. Filtrlarni tozalab, qaytadan urinib ko'ring."
              : "Tasdiqlangan fermangizga birinchi qo'zini qo'shing — u shu zahoti bozorda ko'rinadi."
          }
          action={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={() => onFiltersChange(EMPTY_FILTERS)}
                className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Filtrlarni tozalash
              </button>
            ) : (
              emptyAction
            )
          }
        />
      ) : (
        <>
          {/* Katta ekran: jadval */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th scope="col" className="px-4 py-2.5 font-medium">Qo'zi</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Ferma</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Holat</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Vazn</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Narx</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Investor ulushi
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Sotuv sanasi</th>
                  <th scope="col" className="px-4 py-2.5">
                    <span className="sr-only">Amallar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const meta = LIVESTOCK_STATUS[item.status];
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onOpen(item)}
                      className="cursor-pointer border-b border-stone-100 transition-colors last:border-0 hover:bg-stone-50 dark:border-stone-800/70 dark:hover:bg-stone-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900 dark:text-white">
                          {item.breed ?? "Zoti ko'rsatilmagan"}
                        </div>
                        <div className="text-xs tabular-nums text-stone-400">
                          #{shortId(item.id)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {farmNameById.get(item.farmId) ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip label={meta.label} colorVar={meta.colorVar} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-700 dark:text-stone-200">
                        {item.currentWeightKg} kg
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-700 dark:text-stone-200">
                        {formatUzs(item.priceUzs)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-700 dark:text-stone-200">
                        {item.offeredInvestorSharePercent}%
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {formatDateUz(item.expectedSaleDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpen(item);
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                        >
                          Boshqarish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Kichik ekran: ixcham qatorlar */}
          <ul className="divide-y divide-stone-100 dark:divide-stone-800/70 lg:hidden">
            {pageItems.map((item) => {
              const meta = LIVESTOCK_STATUS[item.status];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-stone-900 dark:text-white">
                          {item.breed ?? "Zoti ko'rsatilmagan"}
                        </span>
                        <span className="text-[11px] tabular-nums text-stone-400">
                          #{shortId(item.id)}
                        </span>
                      </div>
                      <StatusChip label={meta.label} colorVar={meta.colorVar} size="sm" />
                      <div className="flex flex-wrap gap-x-3 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                        <span>{item.currentWeightKg} kg</span>
                        <span>{formatUzs(item.priceUzs)}</span>
                        <span>{item.offeredInvestorSharePercent}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Sahifalash */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 dark:border-stone-800 sm:flex-row">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <span className="tabular-nums">
                {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, visible.length)}
              </span>{" "}
              / jami <span className="tabular-nums">{visible.length}</span> ta
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                Sahifada
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-lg border border-stone-200 bg-white px-1.5 py-1 text-xs dark:border-stone-700 dark:bg-stone-800"
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Oldingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 text-xs tabular-nums text-stone-600 dark:text-stone-300">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= pageCount}
                  aria-label="Keyingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
