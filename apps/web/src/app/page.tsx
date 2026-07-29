import Link from "next/link";
import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { ArrowRight } from "lucide-react";
import { HeroSection, type MarketStats } from "@/components/HeroSection";
import { MarketplacePreview } from "@/components/MarketplacePreview";
import { HowItWorks } from "@/components/HowItWorks";
import { RoiCalculator } from "@/components/RoiCalculator";
import { FeaturesAndSecurity } from "@/components/FeaturesAndSecurity";
import { FaqSection } from "@/components/FaqSection";
import { sectionClass } from "@/components/landing/SectionHeading";

/**
 * E'lonlar bir marta shu yerda olinadi va bo'limlarga tarqatiladi: ilgari
 * bosh ekran ham, bozor namunasi ham alohida so'rov yuborardi.
 */
export default async function Home() {
  let listings: Livestock[] = [];
  let farms: Farm[] = [];

  try {
    const api = getApiClient();
    [listings, farms] = await Promise.all([
      api.livestock.list({ status: "listed" }),
      api.farms.list(),
    ]);
  } catch {
    // Backend yetib bormasa bosh sahifa baribir ochiladi — raqamlar o'rniga "—".
  }

  const stats: MarketStats | null =
    listings.length > 0
      ? {
          count: listings.length,
          minPrice: Math.min(...listings.map((item) => item.priceUzs)),
          minShare: Math.min(
            ...listings.map((item) => item.offeredInvestorSharePercent),
          ),
          maxShare: Math.max(
            ...listings.map((item) => item.offeredInvestorSharePercent),
          ),
        }
      : null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroSection stats={stats} />
      <MarketplacePreview listings={listings} farms={farms} />
      <HowItWorks />
      <RoiCalculator />
      <FeaturesAndSecurity />

      {/* Fermerlar uchun chaqiriq */}
      <section className={sectionClass}>
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-emerald-800 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Fermangiz bormi?</h2>
            <p className="mt-1 text-sm text-emerald-100">
              Fermani tasdiqdan o'tkazing va chorvangizga sarmoya jalb qiling.
            </p>
          </div>
          <Link
            href="/register?role=farmer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50"
          >
            Fermer bo'lib ro'yxatdan o'tish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FaqSection />
    </main>
  );
}
