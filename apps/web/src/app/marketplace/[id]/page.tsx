import Link from "next/link";
import { notFound } from "next/navigation";
import { getApiClient } from "@livestock-invest/api-client";
import { InvestButton } from "./InvestButton";
import { PageTransition } from "@/components/PageTransition";
import {
  ArrowLeft,
  ShieldCheck,
  Scale,
  Calendar,
  Percent,
  MapPin,
  Stethoscope,
  Building2,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

export default async function LivestockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = getApiClient();
  let livestock = await api.livestock.getById(id);

  // Demo fallback if id is a demo id or not found in backend DB
  if (!livestock && id.startsWith("demo-")) {
    livestock = {
      id,
      farmId: "farm-1",
      status: "listed",
      breed: "Hisor zotli saralangan qo'zi",
      currentWeightKg: 42,
      ageMonths: 5,
      priceUzs: 3800000,
      offeredInvestorSharePercent: 70,
      expectedSaleDate: "2026-11-15",
      photoUrls: [],
      createdAt: new Date().toISOString(),
    };
  }

  if (!livestock) {
    notFound();
  }

  // Estimated ROI calculation for visualization
  const estimatedReturn = Math.round(livestock.priceUzs * 1.32);
  const estimatedProfit = estimatedReturn - livestock.priceUzs;
  const investorProfit = Math.round(estimatedProfit * (livestock.offeredInvestorSharePercent / 100));

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Marketplace katalogiga qaytish
        </Link>

        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Escrow Muhofazasida
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Toshkent viloyati, Parkent
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {livestock.breed ?? "Zotdor Qo'zi"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              Holati: {livestock.status === "listed" ? "Investitsiya uchun ochiq" : livestock.status}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visuals & Detailed Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Showcase Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-8 text-white shadow-xl border border-emerald-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Sparkles className="h-3.5 w-3.5" /> Elit Chorva Pasporti
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {livestock.breed ?? "Hisor Zotli Qo'zi"}
                  </h2>
                  <p className="text-zinc-300 text-sm leading-relaxed max-w-md">
                    Maxsus saralangan va standartlarga javob beradigan sog'lom chorva. Parvarish davomida intensiv semirtirish dasturi qo'llaniladi.
                  </p>
                </div>

                <div className="flex sm:flex-col justify-around gap-4 bg-zinc-800/80 p-5 rounded-2xl border border-zinc-700/60 backdrop-blur-xs text-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Joriy Vazni</span>
                    <span className="text-2xl font-black text-emerald-400">{livestock.currentWeightKg} kg</span>
                  </div>
                  {livestock.ageMonths != null && (
                    <div className="pt-2 border-t border-zinc-700/50">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Yoshi</span>
                      <span className="text-lg font-bold text-white">{livestock.ageMonths} oylik</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-emerald-600" /> Boshlang'ich Vazn
                </span>
                <span className="text-lg font-extrabold text-zinc-900 dark:text-white">{livestock.currentWeightKg} kg</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5 text-emerald-600" /> Investor Ulushi
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{livestock.offeredInvestorSharePercent}%</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Kutilayotgan Sotuv
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{livestock.expectedSaleDate}</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-600" /> Salomatlik
                </span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> A'lo (Sertifikatlangan)
                </span>
              </div>
            </div>

            {/* Tabbed Info: Vet & Farm details */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                  Veterinariya Ko'rigi va Rasm-Fotolar
                </h3>
              </div>

              <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white">
                    <span>So'nggi Veterinar Ko'rigi</span>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      Vaktsinalar to'liq
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Chorva veterinariya tekshiruvidan muvaffaqiyatli o'tgan. Barcha zarur emlashlar va profilaktik amaliyotlar bajarilgan. Oylik vazn o'lchovlari shaxsiy kabinetda avtomatik yangilanib boradi.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300">
                  <Building2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div className="text-xs">
                    <span className="font-bold block">Hamkor Ferma: Toshkent Model Ferma №12</span>
                    <span>Reyting: 4.9 ★ | 100% verifikatsiyadan o'tgan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Investment Box (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl bg-zinc-900 p-6 text-white border border-emerald-500/30 shadow-2xl space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <span className="text-xs font-semibold text-zinc-400 block mb-1">
                  Chorvani Xarid Qilish va Sarmoya Kiritish
                </span>
                <div className="text-3xl font-black text-white">
                  {livestock.priceUzs.toLocaleString("uz-UZ")} <span className="text-sm font-normal text-zinc-400">so'm</span>
                </div>
              </div>

              {/* Profit breakdown list */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Investor foyda ulushi:</span>
                  <span className="font-bold text-emerald-400">{livestock.offeredInvestorSharePercent}%</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Kutilayotgan davr sotuv qiymati:</span>
                  <span className="font-semibold text-zinc-200">~{estimatedReturn.toLocaleString("uz-UZ")} so'm</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Taxminiy sof foyda ulushingiz:</span>
                  <span className="font-bold text-emerald-400">+{investorProfit.toLocaleString("uz-UZ")} so'm</span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Pul platformaning Escrow hisobida saqlanadi. Pul faqat fermer o'z majburiyatini boshlagach chiqariladi.
                </span>
              </div>

              {/* Action Button */}
              {livestock.status === "listed" ? (
                <InvestButton livestockId={livestock.id} />
              ) : (
                <div className="p-4 rounded-xl bg-zinc-800 text-center text-xs text-zinc-400 font-semibold border border-zinc-700">
                  Bu chorva hozircha investitsiya uchun ochiq emas (holati: {livestock.status}).
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
