"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Livestock } from "@livestock-invest/shared-types";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Scale,
  Calendar,
  Percent,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

interface MarketplaceClientProps {
  initialListings: Livestock[];
  loadError: string | null;
}

export function MarketplaceClient({ initialListings, loadError }: MarketplaceClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "priceAsc" | "priceDesc" | "shareDesc">("default");

  // Fallback demo items if backend database has no active items yet
  const listings: Livestock[] =
    initialListings.length > 0
      ? initialListings
      : [
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
          {
            id: "demo-4",
            farmId: "farm-4",
            status: "listed",
            breed: "Toshkent zotli semirtirish chorvasi",
            currentWeightKg: 40,
            ageMonths: 5,
            priceUzs: 3600000,
            offeredInvestorSharePercent: 72,
            expectedSaleDate: "2026-11-30",
            photoUrls: [],
            createdAt: new Date().toISOString(),
          },
        ];

  // Filtering
  const filteredListings = listings
    .filter((item) => {
      const matchSearch =
        !searchTerm ||
        (item.breed ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currentWeightKg.toString().includes(searchTerm);
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "priceAsc") return a.priceUzs - b.priceUzs;
      if (sortBy === "priceDesc") return b.priceUzs - a.priceUzs;
      if (sortBy === "shareDesc") return b.offeredInvestorSharePercent - a.offeredInvestorSharePercent;
      return 0;
    });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-emerald-500/20">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <ShoppingBag className="h-3.5 w-3.5" />
              Sarmoya Katalogi
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Marketplace — Zotdor Qo'zilar va Chorvalar
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Tekshirilgan fermalardagi sog'lom chorvalardan birini tanlang va Escrow muhofazasi ostida investitsiya qiling.
            </p>
          </div>
        </div>

        {/* Backend status error warning if any */}
        {loadError && (
          <div className="flex items-center gap-3 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-2xl p-4 text-sm shadow-xs">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <span className="font-bold">Eslatma:</span> Haqiqiy backend ma'lumotlari yuklanmadi ({loadError}). Hozir ko'rsatilayotgan e'lonlar demo namuna hisoblanadi.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1 text-xs font-bold underline hover:no-underline"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Yangilash
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Zoti yoki vazni bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="default">Standart tartib</option>
              <option value="priceAsc">Arzonroq narx</option>
              <option value="priceDesc">Qimmatroq narx</option>
              <option value="shareDesc">Yuqori foyda ulushi (%)</option>
            </select>
          </div>
        </div>

        {/* Grid List with Animations */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredListings.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/marketplace/${item.id}`}
                  className="group relative flex flex-col h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/50"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Escrow Himoyalangan
                    </span>
                    <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Toshkent vil.
                    </span>
                  </div>

                  {/* Breed Title */}
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors mb-3 line-clamp-1">
                    {item.breed ?? "Zotdor Qo'zi"}
                  </h3>

                  {/* Specs */}
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
                        <Percent className="h-3.5 w-3.5 text-emerald-600" /> Shartnoma Ulushi:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.offeredInvestorSharePercent}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <span className="font-medium text-zinc-400">Kutilayotgan sotuv:</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.expectedSaleDate}</span>
                    </div>
                  </div>

                  {/* Price & Action Footer */}
                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">
                        Investitsiya Narxi
                      </span>
                      <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                        {item.priceUzs.toLocaleString("uz-UZ")} <span className="text-xs font-normal text-zinc-500">so'm</span>
                      </span>
                    </div>

                    <span className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-emerald-600 text-white group-hover:bg-emerald-500 transition-all shadow-md">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <Search className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Qidiruv bo'yicha hech narsa topilmadi</h3>
            <p className="text-sm text-zinc-500 mt-1">Boshqa kalit so'z yoki saralash usulini sinab ko'ring.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
