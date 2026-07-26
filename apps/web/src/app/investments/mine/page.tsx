"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getApiClient } from "@livestock-invest/api-client";
import type { Investment, Livestock } from "@livestock-invest/shared-types";
import { PageTransition } from "@/components/PageTransition";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { TrendingUp, ShieldCheck, Coins, Clock, CircleCheck as CheckCircle2, ArrowRight, ShoppingBag, CircleAlert as AlertCircle, Scale, Building2, Calendar, ChevronRight, FileText, Loader as Loader2 } from "lucide-react";

// Escrow process steps for visual tracker
const ESCROW_STEPS = [
  { key: "pending", label: "Muzlatildi", desc: "Escrow hisobida" },
  { key: "released_to_farmer", label: "Boqilmoqda", desc: "Fermer parvarishida" },
  { key: "sale_completed", label: "Sotildi", desc: "Bozorga chiqarildi" },
  { key: "payout_completed", label: "To'landi", desc: "Foyda hisobingizda" },
];

export default function MyInvestmentsPage() {
  const { state } = useRequireAuth("investor");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [livestockMap, setLivestockMap] = useState<Record<string, Livestock>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state !== "authenticated") return;
    const api = getApiClient();
    api.investments
      .listMine()
      .then(async (list) => {
        setInvestments(list);
        const uniqueLivestockIds = Array.from(new Set(list.map((inv) => inv.livestockId)));
        const entries = await Promise.all(
          uniqueLivestockIds.map(async (id) => {
            const item = await api.livestock.getById(id).catch(() => null);
            return [id, item] as const;
          }),
        );
        const map: Record<string, Livestock> = {};
        for (const [id, item] of entries) {
          if (item) map[id] = item;
        }
        setLivestockMap(map);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi"),
      )
      .finally(() => setIsLoading(false));
  }, [state]);

  // Summary calculations
  const totalAmountUzs = investments.reduce((acc, inv) => acc + inv.amountUzs, 0);
  const totalEstimatedProfitUzs = investments.reduce(
    (acc, inv) => acc + (inv.investorShareUzs ?? Math.round(inv.amountUzs * 0.25)),
    0,
  );

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {state !== "authenticated" ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm font-semibold">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" /> Yuklanmoqda...
          </div>
        ) : (
          <>
        {/* Header & Dashboard Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Title Banner */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-7 sm:p-8 text-white shadow-xl border border-emerald-500/20 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Mening Fermam va Portfelim
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Mening Chorva Sarmoyalarim
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                Siz xarid qilgan har bir zotdor chorvaning oylik vazn o'sishi, veterinar nazorati va Escrow xavfsizlik holatini real vaqtda kuzatib boring.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>Barcha chorvalar hamkor fermalarda mustaqil nazoratda</span>
            </div>
          </div>

          {/* Key Portfolio Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            {/* Total Invested */}
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  Jami Kiritilgan Sarmoya
                </span>
                <div className="text-2xl font-black text-zinc-900 dark:text-white">
                  {totalAmountUzs.toLocaleString("uz-UZ")}{" "}
                  <span className="text-xs font-normal text-zinc-500">UZS</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                {investments.length} ta
              </div>
            </div>

            {/* Expected Profit */}
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Kutilayotgan Sof Foyda
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +{totalEstimatedProfitUzs.toLocaleString("uz-UZ")}{" "}
                  <span className="text-xs font-normal text-zinc-500">UZS</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                Escrow
              </div>
            </div>

          </div>
        </div>

        {/* State Indicators */}
        {isLoading && (
          <div className="text-center py-20 text-zinc-500 text-sm font-semibold">
            Portfel ma'lumotlari yuklanmoqda...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && investments.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
            <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Sizda hali faol chorva sarmoyasi yo'q
              </h3>
              <p className="text-sm text-zinc-500">
                Marketplace bo'limiga o'tib, zotdor qo'zilarni tanlang va ularning semirishi evaziga daromad olishni boshlang.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
            >
              Marketplace'ni Ko'rish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Real Livestock Cards List */}
        <div className="space-y-6">
          <AnimatePresence>
            {investments.map((inv, index) => {
              
              // Dynamic Stepper Step Index
              const getCurrentStepIndex = (status: string) => {
                switch (status) {
                  case "pending": return 0;
                  case "released_to_farmer": return 1;
                  case "sale_completed": return 2;
                  case "payout_completed": return 3;
                  default: return 0;
                }
              };

              const currentStep = getCurrentStepIndex(inv.escrowStatus);

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-5 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                        #{inv.livestockId.slice(-3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                          {livestockMap[inv.livestockId]?.breed ?? "Zotdor Qo'zi"}
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            ID: {inv.livestockId.slice(0, 8)}
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Sarmoya sanasi: {new Date(inv.createdAt).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${inv.livestockId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/80 transition-all self-start sm:self-auto"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Chorva Pasporti
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Main Grid: Details & Escrow Visual */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Financial & Weight Details */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 pb-6 lg:pb-0 lg:pr-6">
                      
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          Kiritilgan Sarmoya
                        </span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white">
                          {inv.amountUzs.toLocaleString("uz-UZ")}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">UZS</span>
                      </div>

                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">
                          Investor Foyda Ulushi ({inv.contractProfitSharePercent}%)
                        </span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {inv.investorShareUzs != null
                            ? `+${inv.investorShareUzs.toLocaleString("uz-UZ")}`
                            : "O'sishda..."}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-500 block">
                          Sotuvdan so'ng hisoblanadi
                        </span>
                      </div>

                      <div className="col-span-2 bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 flex items-center gap-1.5 font-semibold">
                          <Scale className="h-4 w-4 text-emerald-600" />
                          {livestockMap[inv.livestockId]?.currentWeightKg != null
                            ? `Joriy vazn: ${livestockMap[inv.livestockId]?.currentWeightKg} kg`
                            : "Prognoz oylik o'sish:"}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {livestockMap[inv.livestockId]?.currentWeightKg != null
                            ? "+2.5 - 3.2 kg / oy"
                            : "+2.5 - 3.2 kg / oy"}
                        </span>
                      </div>

                    </div>

                    {/* Visual Escrow Progress Tracker (Stepper) */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex justify-between items-center text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                        <span>Escrow va Boqish Statusi:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {ESCROW_STEPS[currentStep]?.label || "Jarayonda"}
                        </span>
                      </div>

                      {/* Stepper Bar */}
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {ESCROW_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div key={step.key} className="space-y-2">
                              <div
                                className={`h-2.5 rounded-full transition-all ${
                                  isDone
                                    ? "bg-emerald-500"
                                    : "bg-zinc-200 dark:bg-zinc-800"
                                } ${isCurrent ? "ring-2 ring-emerald-500/30" : ""}`}
                              />
                              <div className="text-[10px]">
                                <p
                                  className={`font-bold truncate ${
                                    isDone
                                      ? "text-zinc-900 dark:text-white"
                                      : "text-zinc-400"
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-zinc-400 dark:text-zinc-500 truncate hidden sm:block">
                                  {step.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Escrow Guarantee Footer inside Card */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-500">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Sarmoyangiz shartnoma muddati tugagunga qadar bank Escrow hisobida muhofaza qilinadi.
                        </span>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

          </>
        )}
      </main>
    </PageTransition>
  );
}