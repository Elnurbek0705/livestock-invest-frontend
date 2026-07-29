"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getApiClient } from "@livestock-invest/api-client";
import type { Investment, Transaction } from "@livestock-invest/shared-types";
import { PageTransition } from "@/components/PageTransition";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "@/lib/uz";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Coins,
  Receipt,
  AlertCircle,
  FileText,
} from "lucide-react";

const STEPPER_STAGES = [
  { id: "pending", title: "1. Escrow Depozit", desc: "Mablag' muhofazada saqlanmoqda" },
  { id: "released_to_farmer", title: "2. Fermerga Berildi", desc: "Chorvani boqish va semirtirish jarayoni" },
  { id: "sale_completed", title: "3. Sotuv Yakunlandi", desc: "Bozor narxida sotildi" },
  { id: "payout_completed", title: "4. Foyda Taqsimlandi", desc: "Sarmoya va foyda investorga tushdi" },
];

export default function InvestmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([api.investments.getById(id), api.investments.getTransactions(id)])
      .then(([invData, txData]) => {
        if (!invData) {
          setError("Investitsiya topilmadi");
        } else {
          setInvestment(invData);
          setTransactions(txData || []);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi"),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-zinc-500 text-sm font-semibold">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {error ?? "Investitsiya topilmadi"}
        </h2>
        <Link
          href="/investments/mine"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Mening investitsiyalarimga qaytish
        </Link>
      </div>
    );
  }

  // Find current step index
  const currentStepIndex = STEPPER_STAGES.findIndex(
    (s) => s.id === investment.escrowStatus,
  );

  return (
    <PageTransition>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Navigation */}
        <Link
          href="/investments/mine"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Mening investitsiyalarimga qaytish
        </Link>

        {/* Top Header Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Bitim ID: {investment.id.slice(0, 8)}...
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Investitsiya Shartnomasi Tafsilotlari
              </h1>
            </div>

            <Link
              href={`/marketplace/${investment.livestockId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all w-fit"
            >
              <FileText className="h-4 w-4 text-emerald-600" />
              Chorva Pasporti
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <span className="text-xs text-zinc-400 font-medium block">Kiritilgan Sarmoya:</span>
              <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                {investment.amountUzs.toLocaleString("uz-UZ")} so'm
              </span>
            </div>

            <div>
              <span className="text-xs text-zinc-400 font-medium block">Shartnoma Ulushi:</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {investment.contractProfitSharePercent}%
              </span>
            </div>

            <div>
              <span className="text-xs text-zinc-400 font-medium block">Investorga Tegishli Foyda:</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {investment.investorShareUzs != null
                  ? `${investment.investorShareUzs.toLocaleString("uz-UZ")} so'm`
                  : "Sotuvdan so'ng hisoblanadi"}
              </span>
            </div>
          </div>
        </div>

        {/* Escrow Stepper Lifecycle */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Escrow Bitim Bosqichlari (Lifecycle)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {STEPPER_STAGES.map((step, idx) => {
              const isCompleted = idx <= (currentStepIndex >= 0 ? currentStepIndex : 0);
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md"
                      : isCompleted
                      ? "bg-zinc-50 dark:bg-zinc-800/60 border-emerald-500/40"
                      : "bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        Joriy Holat
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-normal">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Timeline */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Moliya va Pul Harakatlari Tarixi (Transactions)
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              Jami tranzaksiyalar: {transactions.length} ta
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">Hali hech qanday tranzaksiya amalga oshirilmadi.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                        {TRANSACTION_TYPE[tx.type]}
                      </h4>
                      <span className="text-xs text-zinc-400">
                        {new Date(tx.createdAt).toLocaleString("uz-UZ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      {tx.amountUzs.toLocaleString("uz-UZ")} so'm
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      Holati: {TRANSACTION_STATUS[tx.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
