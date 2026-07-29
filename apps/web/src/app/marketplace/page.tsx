import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { MarketplaceClient } from "./MarketplaceClient";

/**
 * E'lonlar bilan birga fermalar ham olinadi: qo'zi yozuvida faqat `farmId`
 * bor, foydalanuvchiga esa ferma nomi va hududi kerak. Ilgari hudud qattiq
 * kodlangan "Toshkent vil." edi — bu ko'rsatkich haqiqatga mos emas edi.
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

  const isDemo = listings.length === 0;

  return (
    <MarketplaceClient
      listings={isDemo ? DEMO_LISTINGS : listings}
      farms={isDemo ? DEMO_FARMS : farms}
      loadError={loadError}
      isDemo={isDemo}
    />
  );
}

// ============================================================
// Namuna ma'lumot — backend hali bo'sh bo'lganda sahifa tirik ko'rinsin.
// Foydalanuvchiga bu namuna ekani ochiq aytiladi (MarketplaceClient dagi
// ogohlantirish), shuning uchun uni haqiqiy e'lon deb o'ylab qolmaydi.
// ============================================================

const DEMO_FARMS: Farm[] = [
  {
    id: "farm-1",
    ownerUserId: "demo",
    name: "Oqdaryo fermasi",
    region: "Xorazm",
    district: "Yangibozor",
    rating: 4.8,
    verificationStatus: "platform_approved",
    isPremium: false,
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "farm-2",
    ownerUserId: "demo",
    name: "Zarafshon chorva xo'jaligi",
    region: "Buxoro",
    district: "G'ijduvon",
    rating: 4.6,
    verificationStatus: "platform_approved",
    isPremium: false,
    createdAt: "2026-02-04T00:00:00.000Z",
  },
  {
    id: "farm-3",
    ownerUserId: "demo",
    name: "Amudaryo qo'ychilik markazi",
    region: "Qoraqalpog'iston",
    district: "Nukus",
    rating: 4.9,
    verificationStatus: "platform_approved",
    isPremium: true,
    createdAt: "2026-02-19T00:00:00.000Z",
  },
];

const DEMO_LISTINGS: Livestock[] = [
  {
    id: "demo-1",
    farmId: "farm-1",
    status: "listed",
    breed: "Hisor zotli qo'zi (erkak)",
    currentWeightKg: 42,
    ageMonths: 5,
    priceUzs: 3_800_000,
    offeredInvestorSharePercent: 70,
    expectedSaleDate: "2026-11-15",
    photoUrls: [],
    createdAt: "2026-07-20T00:00:00.000Z",
  },
  {
    id: "demo-2",
    farmId: "farm-2",
    status: "listed",
    breed: "Qorabair saralangan qo'zi",
    currentWeightKg: 38,
    ageMonths: 4,
    priceUzs: 3_200_000,
    offeredInvestorSharePercent: 75,
    expectedSaleDate: "2026-12-01",
    photoUrls: [],
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "demo-3",
    farmId: "farm-3",
    status: "listed",
    breed: "Hisor elit zotdor qo'chqor",
    currentWeightKg: 48,
    ageMonths: 6,
    priceUzs: 4_500_000,
    offeredInvestorSharePercent: 70,
    expectedSaleDate: "2026-10-30",
    photoUrls: [],
    createdAt: "2026-07-15T00:00:00.000Z",
  },
  {
    id: "demo-4",
    farmId: "farm-1",
    status: "listed",
    breed: "Jaydari semirtirish qo'zisi",
    currentWeightKg: 34,
    ageMonths: 4,
    priceUzs: 2_700_000,
    offeredInvestorSharePercent: 72,
    expectedSaleDate: "2026-11-30",
    photoUrls: [],
    createdAt: "2026-07-12T00:00:00.000Z",
  },
];
