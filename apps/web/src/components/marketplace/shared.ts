/**
 * Bozor ro'yxati uchun umumiy tiplar va filtr qoidalari.
 *
 * Kartochka ko'rinishi ham, jadval ko'rinishi ham bitta `ListingRow` bilan
 * ishlaydi — shuning uchun ikkalasida ham ayni ma'lumot ko'rinadi.
 */

import type { Farm, Livestock } from "@livestock-invest/shared-types";

export interface ListingRow extends Livestock {
  /** Ferma nomi — backend bermasa `null` */
  farmName: string | null;
  /** Ferma hududi — backend bermasa `null` */
  region: string | null;
}

/**
 * E'lonlarga ferma ma'lumotini biriktiradi.
 *
 * Hudud avval qattiq kodlangan "Toshkent vil." edi — endi haqiqiy ferma
 * yozuvidan olinadi, topilmasa umuman ko'rsatilmaydi.
 */
export function joinFarms(items: Livestock[], farms: Farm[]): ListingRow[] {
  const byId = new Map(farms.map((farm) => [farm.id, farm]));
  return items.map((item) => {
    const farm = byId.get(item.farmId);
    return {
      ...item,
      farmName: farm?.name ?? null,
      region: farm?.region ?? null,
    };
  });
}

// ============================================================
// Filtrlar
// ============================================================

export type PriceBucket = "all" | "under3" | "3to5" | "over5";

export const PRICE_BUCKETS: Record<
  PriceBucket,
  { label: string; test: (priceUzs: number) => boolean }
> = {
  all: { label: "Barcha narxlar", test: () => true },
  under3: { label: "3 mln so'mgacha", test: (p) => p < 3_000_000 },
  "3to5": { label: "3–5 mln so'm", test: (p) => p >= 3_000_000 && p <= 5_000_000 },
  over5: { label: "5 mln so'mdan yuqori", test: (p) => p > 5_000_000 },
};

/** Investor ulushining eng past chegarasi (foizda) */
export const SHARE_FLOORS = [0, 60, 70, 75] as const;

export type SortKey = "newest" | "priceAsc" | "priceDesc" | "shareDesc" | "saleSoon";

export const SORT_LABELS: Record<SortKey, string> = {
  newest: "Avval yangilari",
  priceAsc: "Narx: arzondan qimmatga",
  priceDesc: "Narx: qimmatdan arzonga",
  shareDesc: "Investor ulushi: yuqoridan",
  saleSoon: "Sotuv sanasi: yaqinlari",
};

export interface MarketFilters {
  query: string;
  region: string | "all";
  price: PriceBucket;
  shareFloor: number;
  sort: SortKey;
}

export const EMPTY_FILTERS: MarketFilters = {
  query: "",
  region: "all",
  price: "all",
  shareFloor: 0,
  sort: "newest",
};

/** Saralashdan tashqari nechta filtr yoqilgan — mobil tugmadagi nishon uchun */
export function activeFilterCount(filters: MarketFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.region !== "all") count += 1;
  if (filters.price !== "all") count += 1;
  if (filters.shareFloor > 0) count += 1;
  return count;
}

export function applyFilters(rows: ListingRow[], filters: MarketFilters): ListingRow[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    if (filters.region !== "all" && row.region !== filters.region) return false;
    if (!PRICE_BUCKETS[filters.price].test(row.priceUzs)) return false;
    if (row.offeredInvestorSharePercent < filters.shareFloor) return false;
    if (!query) return true;
    const haystack = [row.breed ?? "", row.farmName ?? "", row.region ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sort) {
      case "priceAsc":
        return a.priceUzs - b.priceUzs;
      case "priceDesc":
        return b.priceUzs - a.priceUzs;
      case "shareDesc":
        return b.offeredInvestorSharePercent - a.offeredInvestorSharePercent;
      case "saleSoon":
        return a.expectedSaleDate.localeCompare(b.expectedSaleDate);
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return sorted;
}

/** Ferma yozuvi bo'lmasa "—" chiqmasligi uchun: bor bo'lgan qismini birlashtiradi */
export function farmLine(row: ListingRow): string | null {
  const parts = [row.farmName, row.region].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}
