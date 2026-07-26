"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, TrendingUp, Sparkles, PieChart, ShieldCheck } from "lucide-react";

export function RoiCalculator() {
  const [amountUzs, setAmountUzs] = useState<number>(10000000); // 10 mln uzs
  const [months, setMonths] = useState<number>(6); // 6 oylik sikl
  const [investorSharePercent, setInvestorSharePercent] = useState<number>(70); // 70% foyda ulushi

  // Taxminiy hisob-kitob koeffitsientlari (real agro-iqtisodiy standartlar bo'yicha)
  // Masalan: 10,000,000 UZS investitsiyaga 6 oyda ~28-36% sof foyda to'g'ri keladi
  const estimatedAnnualYieldRate = months === 4 ? 0.22 : months === 6 ? 0.32 : 0.42; 
  
  const estimatedGrossProfit = Math.round(amountUzs * estimatedAnnualYieldRate);
  const investorProfit = Math.round(estimatedGrossProfit * (investorSharePercent / 100));
  const totalReturn = amountUzs + investorProfit;
  const netRoiPercent = ((investorProfit / amountUzs) * 100).toFixed(1);

  const formatUzs = (val: number) => {
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  return (
    <div id="calculator" className="scroll-mt-24 my-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-emerald-500/20">
        {/* Glow effect background */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column - Form controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <Calculator className="h-3.5 w-3.5" />
                Interaktiv Daromad Kalkulyatori
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Investitsiya va Kutilayotgan Foydangizni Hisoblang
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Chorvani semirtirish davri va kiritiladigan summa asosida taxminiy daromadingizni aniqlang.
              </p>
            </div>

            {/* Slider 1: Investment Amount */}
            <div className="space-y-3 bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50 backdrop-blur-xs">
              <div className="flex justify-between items-center text-sm font-semibold">
                <label className="text-zinc-300">Investitsiya summasi:</label>
                <span className="text-lg font-bold text-emerald-400">
                  {formatUzs(amountUzs)}
                </span>
              </div>
              <input
                type="range"
                min={2000000}
                max={50000000}
                step={1000000}
                value={amountUzs}
                onChange={(e) => setAmountUzs(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>2,000,000 so'm</span>
                <span>25,000,000 so'm</span>
                <span>50,000,000 so'm</span>
              </div>
            </div>

            {/* Selector 2: Cycle Duration */}
            <div className="space-y-3 bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50 backdrop-blur-xs">
              <label className="block text-sm font-semibold text-zinc-300">
                Boqish va Semirtirish Muddati:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { m: 4, label: "4 Oylik", tag: "Tezkor sikl" },
                  { m: 6, label: "6 Oylik", tag: "Tavsiya etiladi" },
                  { m: 8, label: "8 Oylik", tag: "Maksimal vazn" },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => setMonths(item.m)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      months === item.m
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 font-bold"
                        : "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-base font-bold">{item.label}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 3: Profit Share Percent */}
            <div className="space-y-2 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Shartnomaviy foyda ulushi (Investor):</span>
                <span className="font-bold text-emerald-400">{investorSharePercent}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Asosiy sarmoyagiz Escrow hisobida to'liq muhofaza qilinadi.</span>
              </div>
            </div>
          </div>

          {/* Right Column - Results Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-zinc-950 p-6 sm:p-8 border border-emerald-500/30 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <span className="text-sm font-semibold text-zinc-400 flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-emerald-400" />
                  Natija Hisob-Kitobi
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  +{netRoiPercent}% Daromadlilik
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Boshlang'ich sarmoya:</span>
                  <span className="font-semibold text-white">{formatUzs(amountUzs)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Umumiy kutilayotgan foyda:</span>
                  <span className="font-semibold text-zinc-200">{formatUzs(estimatedGrossProfit)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Investorning ulushi ({investorSharePercent}%):</span>
                  <span className="font-bold text-emerald-400">+{formatUzs(investorProfit)}</span>
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                    Davr yakunidagi umumiy qaytadigan summa:
                  </span>
                  <div className="text-3xl font-extrabold text-white tracking-tight text-emerald-400">
                    {formatUzs(totalReturn)}
                  </div>
                </div>
              </div>

              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Marketplacedan Qo'zi Tanlash
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
