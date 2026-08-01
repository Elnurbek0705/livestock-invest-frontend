"use client";

/**
 * Bozor sahifasi.
 *
 * Tuzilishi ataylab "kartochkalar dengizi" emas: chapda o'zgarmas filtr
 * ustuni, o'ngda natijalar. Foydalanuvchi ko'zi bitta ustundan pastga
 * yuguradi, ma'lumot esa har doim bir xil joyda turadi. E'lonlar soni
 * o'sganda sahifa uzayib ketmasligi uchun sahifalash bor, ko'p e'lonni
 * solishtirish uchun esa jadval ko'rinishiga o'tish mumkin.
 */

import { useEffect, useMemo, useState } from "react";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Percent,
  Rows3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  Wallet,
  X,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import {
  EmptyState,
  Panel,
  StatTile,
  controlClass,
} from "@/components/dashboard/primitives";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingTable } from "@/components/marketplace/ListingTable";
import {
  EMPTY_FILTERS,
  PRICE_BUCKETS,
  SHARE_FLOORS,
  SORT_LABELS,
  activeFilterCount,
  applyFilters,
  joinFarms,
  type MarketFilters,
  type PriceBucket,
  type SortKey,
} from "@/components/marketplace/shared";
import { formatUzsCompact } from "@/lib/uz";

interface MarketplaceClientProps {
  listings: Livestock[];
  farms: Farm[];
  loadError: string | null;
}

/** Katakda 3×4, jadvalda esa qatorlar ixcham — shuning uchun sig'imi boshqa. */
const PAGE_SIZE = { grid: 12, table: 20 } as const;

export function MarketplaceClient({
  listings,
  farms,
  loadError,
}: MarketplaceClientProps) {
  const [filters, setFilters] = useState<MarketFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = useMemo(() => joinFarms(listings, farms), [listings, farms]);
  const visible = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  const regions = useMemo(() => {
    const unique = new Set(
      rows.map((row) => row.region).filter((region): region is string => Boolean(region)),
    );
    return [...unique].sort((a, b) => a.localeCompare(b, "uz"));
  }, [rows]);

  // Sahifa boshidagi ko'rsatkichlar — narx va ulush oralig'i butun ro'yxat
  // bo'yicha hisoblanadi, filtrdan keyin emas: bu bozorning umumiy manzarasi.
  const summary = useMemo(() => {
    if (rows.length === 0) return null;
    const prices = rows.map((row) => row.priceUzs);
    const shares = rows.map((row) => row.offeredInvestorSharePercent);
    return {
      minPrice: Math.min(...prices),
      minShare: Math.min(...shares),
      maxShare: Math.max(...shares),
    };
  }, [rows]);

  const pageSize = PAGE_SIZE[view];
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = visible.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Filtr yoki ko'rinish o'zgarsa birinchi sahifaga qaytamiz — aks holda
  // foydalanuvchi bo'sh sahifada qolib ketadi.
  useEffect(() => {
    setPage(1);
  }, [filters, view]);

  const update = (patch: Partial<MarketFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const activeCount = activeFilterCount(filters);

  const filterFields = (
    <div className="space-y-4 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
          placeholder="Zot yoki ferma"
          aria-label="E'lonlar orasidan qidirish"
          className={`${controlClass} w-full pl-9`}
        />
      </div>

      {regions.length > 1 && (
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Hudud
          </span>
          <select
            value={filters.region}
            onChange={(event) => update({ region: event.target.value })}
            className={`${controlClass} w-full`}
          >
            <option value="all">Barcha hududlar</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block space-y-1.5">
        <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
          Sarmoya narxi
        </span>
        <select
          value={filters.price}
          onChange={(event) => update({ price: event.target.value as PriceBucket })}
          className={`${controlClass} w-full`}
        >
          {(Object.keys(PRICE_BUCKETS) as PriceBucket[]).map((key) => (
            <option key={key} value={key}>
              {PRICE_BUCKETS[key].label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
          Investor ulushi
        </span>
        <select
          value={filters.shareFloor}
          onChange={(event) => update({ shareFloor: Number(event.target.value) })}
          className={`${controlClass} w-full`}
        >
          {SHARE_FLOORS.map((floor) => (
            <option key={floor} value={floor}>
              {floor === 0 ? "Barcha takliflar" : `${floor}% va yuqori`}
            </option>
          ))}
        </select>
      </label>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <X className="h-3.5 w-3.5" /> Filtrlarni tozalash
        </button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sarlavha — bitta jumla, keyin raqamlar */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Bozor
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Tasdiqlangan fermalardagi qo'zilar. Sarmoya kafolat (escrow) hisobida
            saqlanadi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile
            icon={Sprout}
            label="Ochiq e'lonlar"
            value={String(rows.length)}
            accent
          />
          <StatTile
            icon={Wallet}
            label="Eng past sarmoya"
            value={summary ? formatUzsCompact(summary.minPrice) : "—"}
          />
          <StatTile
            icon={Percent}
            label="Investor ulushi"
            value={
              summary
                ? summary.minShare === summary.maxShare
                  ? `${summary.maxShare}%`
                  : `${summary.minShare}–${summary.maxShare}%`
                : "—"
            }
            hint="Shartnoma bo'yicha foyda ulushi"
          />
        </div>

        {loadError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              E'lonlarni yuklab bo'lmadi.
              <span className="mt-1 block text-xs opacity-80">{loadError}</span>
            </p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-4">
          {/* Filtr ustuni */}
          <aside className="lg:col-span-1">
            <Panel className="hidden lg:sticky lg:top-24 lg:block">{filterFields}</Panel>
            {filtersOpen && <Panel className="lg:hidden">{filterFields}</Panel>}
          </aside>

          {/* Natijalar */}
          <div className="lg:col-span-3">
            <Panel className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 dark:border-stone-800">
                <p className="mr-auto text-sm text-stone-600 dark:text-stone-300">
                  <span className="font-semibold tabular-nums text-stone-900 dark:text-white">
                    {visible.length}
                  </span>{" "}
                  ta e'lon
                </p>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  className={`${controlClass} inline-flex items-center gap-1.5 font-semibold lg:hidden`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtr
                  {activeCount > 0 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </button>

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

                <div
                  role="group"
                  aria-label="Ko'rinish"
                  className="flex rounded-xl border border-stone-200 p-0.5 dark:border-stone-700"
                >
                  {(
                    [
                      { key: "grid", icon: LayoutGrid, label: "Katak ko'rinishi" },
                      { key: "table", icon: Rows3, label: "Jadval ko'rinishi" },
                    ] as const
                  ).map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      aria-label={label}
                      aria-pressed={view === key}
                      className={`rounded-lg p-1.5 transition-colors ${
                        view === key
                          ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                          : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ikki xil bo'shlik, ikki xil sabab: bozorda umuman e'lon
                  yo'qmi, yoki filtrlar hammasini chetlab o'tdimi. Bittasini
                  ikkinchisining matni bilan ko'rsatsak, foydalanuvchi yo'q
                  filtrni tozalashga urinib vaqt yo'qotadi. */}
              {rows.length === 0 ? (
                <EmptyState
                  icon={Sprout}
                  title="Hozircha e'lon yo'q"
                  description="Bozorga hali birorta qo'zi qo'yilmagan. Fermerlar e'lon joylashi bilan shu yerda ko'rinadi."
                />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Mos e'lon topilmadi"
                  description="Tanlangan shartlarga mos qo'zi yo'q. Filtrlarni kengaytirib ko'ring."
                  action={
                    activeCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setFilters(EMPTY_FILTERS)}
                        className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        Filtrlarni tozalash
                      </button>
                    ) : undefined
                  }
                />
              ) : view === "grid" ? (
                <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pageRows.map((row) => (
                    <ListingCard key={row.id} row={row} />
                  ))}
                </div>
              ) : (
                <ListingTable rows={pageRows} />
              )}

              {visible.length > pageSize && (
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    <span className="tabular-nums">
                      {(safePage - 1) * pageSize + 1}–
                      {Math.min(safePage * pageSize, visible.length)}
                    </span>{" "}
                    / jami <span className="tabular-nums">{visible.length}</span> ta
                  </p>

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
              )}
            </Panel>

            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              Ko'rsatilgan ulush — sotuvdan keyingi foyda taqsimoti bo'yicha shartnoma
              ulushi. Bu kafolatlangan daromad emas: yakuniy natija sotuv narxiga bog'liq.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
