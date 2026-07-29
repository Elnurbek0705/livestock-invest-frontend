import Link from "next/link";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { joinFarms } from "@/components/marketplace/shared";
import { SectionHeading, sectionClass } from "@/components/landing/SectionHeading";

/**
 * Bosh sahifadagi bozor namunasi.
 *
 * Kartochka `/marketplace` dagi bilan aynan bitta komponent — foydalanuvchi
 * bosh sahifada ko'rgan narsasini bozorda ham xuddi shu ko'rinishda topadi.
 */
export function MarketplacePreview({
  listings,
  farms,
}: {
  listings: Livestock[];
  farms: Farm[];
}) {
  const rows = joinFarms(listings, farms).slice(0, 3);

  if (rows.length === 0) return null;

  return (
    <section className={sectionClass}>
      <SectionHeading
        title="Bozordagi so'nggi e'lonlar"
        subtitle="Veterinar ko'rigidan o'tgan, tasdiqlangan fermalardagi qo'zilar"
        action={
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Barchasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <ListingCard key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}
