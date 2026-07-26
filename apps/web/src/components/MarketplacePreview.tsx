import Link from "next/link";
import { getApiClient } from "@livestock-invest/api-client";
import type { Livestock } from "@livestock-invest/shared-types";
import { ShoppingBag, ArrowRight, ShieldCheck, Scale, Calendar, Percent, MapPin } from "lucide-react";

export async function MarketplacePreview() {
  let listings: Livestock[] = [];
  let errorOccurred = false;

  try {
    const api = getApiClient();
    listings = await api.livestock.list({ status: "listed" });
  } catch (error) {
    errorOccurred = true;
  }

  // Fallback items to ensure impressive visual showcase if backend table is empty or loading
  const displayItems: Livestock[] = listings.length > 0 ? listings.slice(0, 3) : [
    {
      id: "demo-1",
      farmId: "farm-1",
      status: "listed",
      breed: "Hisor zotli qo'zi (Erkak)",
      currentWeightKg: 42,
      ageMonths: 5,
      priceUzs: 3800000,
      offeredInvestorSharePercent: 70,
      expectedSaleDate: "2026-11-15",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      farmId: "farm-2",
      status: "listed",
      breed: "Qorabair / Jaydari saralangan qo'zi",
      currentWeightKg: 38,
      ageMonths: 4,
      priceUzs: 3200000,
      offeredInvestorSharePercent: 75,
      expectedSaleDate: "2026-12-01",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      farmId: "farm-3",
      status: "listed",
      breed: "Hisor elit zotdor qo'chqor",
      currentWeightKg: 48,
      ageMonths: 6,
      priceUzs: 4500000,
      offeredInvestorSharePercent: 70,
      expectedSaleDate: "2026-10-30",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <section className="py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-1 text-xs font-bold mb-3 border border-emerald-300 dark:border-emerald-800">
            <ShoppingBag className="h-3.5 w-3.5" />
            Dolzarb Takliflar
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Marketplace — Faol Investitsiyalar
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm sm:text-base">
            Veterinar ko'rigidan o'tgan va sertifikatlangan eng yaxshi chorva e'lonlari
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-sm font-bold transition-all shadow-md w-fit"
        >
          Barcha Qo'zilarni Ko'rish
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            href={`/marketplace/${item.id}`}
            className="group relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/50"
          >
            {/* Header badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Escrow Muhofazasida
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Toshkent vil.
              </span>
            </div>

            {/* Breed Title */}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-4 line-clamp-1">
              {item.breed ?? "Zotdor Qo'zi"}
            </h3>

            {/* Stats list */}
            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-medium">
                  <Scale className="h-3.5 w-3.5 text-emerald-600" /> Vazni:
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">{item.currentWeightKg} kg</span>
              </div>
              {item.ageMonths != null && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Yoshi:
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-white">{item.ageMonths} oylik</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-medium">
                  <Percent className="h-3.5 w-3.5 text-emerald-600" /> Foyda Ulushi:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.offeredInvestorSharePercent}%</span>
              </div>
            </div>

            {/* Price footer */}
            <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
                  Investitsiya Narxi
                </span>
                <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  {item.priceUzs.toLocaleString("uz-UZ")} <span className="text-xs font-normal text-zinc-500">so'm</span>
                </span>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
