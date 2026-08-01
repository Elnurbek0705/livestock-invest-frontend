import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { MarketplaceClient } from "./MarketplaceClient";

/**
 * E'lonlar bilan birga fermalar ham olinadi: qo'zi yozuvida faqat `farmId`
 * bor, foydalanuvchiga esa ferma nomi va hududi kerak. Ilgari hudud qattiq
 * kodlangan "Toshkent vil." edi — bu ko'rsatkich haqiqatga mos emas edi.
 *
 * Ilgari bu yerda backend bo'sh bo'lganda ko'rsatiladigan namuna e'lonlar
 * turardi — sahifa tirik ko'rinsin degan niyatda. Ular olib tashlandi:
 * kartochka bosilganda mavjud bo'lmagan sahifaga olib borardi va "e'lon
 * topilmadi" chiqardi. Bo'sh bozorni bo'sh deb ko'rsatgan halolroq va
 * tushunarliroq.
 */
export default async function MarketplacePage() {
  let listings: Livestock[] = [];
  let farms: Farm[] = [];
  let loadError: string | null = null;

  try {
    const api = getApiClient();
    [listings, farms] = await Promise.all([
      api.livestock.list({ status: "listed" }),
      api.farms.list(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Ma'lumotlarni yuklab bo'lmadi. Backend ishga tushganiga ishonch hosil qiling.";
  }

  return (
    <MarketplaceClient listings={listings} farms={farms} loadError={loadError} />
  );
}
