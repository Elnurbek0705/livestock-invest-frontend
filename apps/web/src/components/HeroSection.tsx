"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Scale,
  Activity,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function HeroSection() {
  // Dynamic Calculator state (Chorvachilik mantig'iga mos)
  const [initialWeight, setInitialWeight] = useState<number>(30); // kg
  const [months, setMonths] = useState<number>(6);
  const [avgMonthlyGain] = useState<number>(2.5); // kg/oy
  const pricePerKg = 85000; // UZS/kg (misol uchun bozor narxi)

  const finalWeight = initialWeight + months * avgMonthlyGain;
  const estimatedMarketValue = finalWeight * pricePerKg;
  const initialValue = initialWeight * pricePerKg;
  const estimatedProfit = estimatedMarketValue - initialValue;

  return (
    <section className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-transparent dark:from-zinc-950 dark:via-emerald-950/10 dark:to-transparent">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: Main Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>O'zbekistonda Birinchi Escrow Kafolatli Chorvachilik Platformasi</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]"
            >
              Zotdor Qo'zilarga Investitsiya Qiling.{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Daromad Vazn O'sishida!
              </span>
            </motion.h1>

            {/* True Business Logic Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Static foizlar yo'q! Siz real zotdor qo'zi sotib olasiz, ferma uni boqadi. Har oylik vazn ortishi va veterinar hisobotlari shaffof holda profilingizda aks etadi.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Marketplace'dagi Qo'zilar
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#live-calc"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-base transition-all backdrop-blur-md"
              >
                <Calculator className="h-4 w-4 text-emerald-600" />
                Vazn O'sishini Hisoblash
              </a>
            </motion.div>

            {/* Real Business Guarantees */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-3 gap-3 text-left max-w-lg mx-auto lg:mx-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> Escrow Hisob
                </div>
                <p className="text-[11px] text-zinc-500">Pulingiz bankda xavfsiz</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  <Scale className="h-4 w-4 text-emerald-600 shrink-0" /> Oylik Vazn
                </div>
                <p className="text-[11px] text-zinc-500">Aniq kg hisoboti</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                  <Activity className="h-4 w-4 text-emerald-600 shrink-0" /> Vet Nazorat
                </div>
                <p className="text-[11px] text-zinc-500">Sug'urta va emlash</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Farm / Weight Simulator Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl border border-emerald-500/20 bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl text-white space-y-6">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                    Interaktiv Model
                  </span>
                  <h3 className="font-bold text-lg text-white">Chorva O'sish Simulyatori</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Real Mantiq
                </span>
              </div>

              {/* Calculator Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-400">Boshlang'ich Vazn:</span>
                    <span className="text-emerald-400 font-bold">{initialWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="45"
                    step="1"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-400">Boqish Davomiyligi:</span>
                    <span className="text-emerald-400 font-bold">{months} Oy</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Results Card */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-zinc-800/70 p-3.5 rounded-2xl border border-zinc-700/60">
                  <span className="text-xs text-zinc-400 block mb-1">Kutilayotgan Og'irlik:</span>
                  <span className="text-2xl font-black text-white">{finalWeight} kg</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    (+{(months * avgMonthlyGain).toFixed(1)} kg semirish)
                  </span>
                </div>

                <div className="bg-zinc-800/70 p-3.5 rounded-2xl border border-zinc-700/60">
                  <span className="text-xs text-zinc-400 block mb-1">Taxminiy Sof Foyda:</span>
                  <span className="text-xl font-black text-emerald-400">
                    +{estimatedProfit.toLocaleString("uz-UZ")} UZS
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Bozor narxi: 85,000 UZS/kg
                  </span>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="flex items-start gap-2.5 text-xs bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200/90">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Daromad kafolatlangan foiz emas, balki ferma parvarishi va hayvonning real kg o'sishidan shakllanadi.
                </span>
              </div>

              {/* Escrow Footer */}
              <div className="flex items-center justify-between text-xs bg-emerald-950/50 border border-emerald-800/60 p-3.5 rounded-2xl text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Xarid mablag'i boqish davomida Escrow'da saqlanadi</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}