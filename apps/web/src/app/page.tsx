import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { MarketplacePreview } from "@/components/MarketplacePreview";
import { HowItWorks } from "@/components/HowItWorks";
import { RoiCalculator } from "@/components/RoiCalculator";
import { FeaturesAndSecurity } from "@/components/FeaturesAndSecurity";
import { FaqSection } from "@/components/FaqSection";
import { Sprout, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Live Marketplace Preview */}
      <MarketplacePreview />

      {/* 3. How It Works */}
      <HowItWorks />

      {/* 4. ROI Calculator */}
      <RoiCalculator />

      {/* 5. Features & Security */}
      <FeaturesAndSecurity />

      {/* 6. Farmer CTA Banner */}
      <section className="my-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/20">
                <Sprout className="h-4 w-4" /> Fermerlar Uchun Imkoniyat
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chorva Fermangiz Bormi? Sarmoyadorlarni Jalb Qiling!
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Platformamizga fermer sifatida qo'shiling, fermangizni verifikatsiyadan o'tkazing va chorvangizni boqish uchun investorlar mablag'ini qonuniy jalb qiling.
              </p>
            </div>

            <Link
              href="/register?role=farmer"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              Fermer Sifatida Ro'yxatdan O'tish
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <FaqSection />
    </main>
  );
}
