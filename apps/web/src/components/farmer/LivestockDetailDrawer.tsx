"use client";

/**
 * Bitta qo'zining to'liq kartasi — o'ngdan chiqadigan panel.
 *
 * Ro'yxat qatorlari faqat eng zarur ustunlarni ko'rsatadi; qolgan hamma narsa
 * (bosqichlar zanjiri, oylik hisobotlar tarixi, batafsil ma'lumot) shu yerda.
 * Shu tufayli jadval yuzlab qator bo'lganda ham ixcham qoladi.
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, FilePlus, Loader2, Scale, X } from "lucide-react";
import type {
  Farm,
  Livestock,
  LivestockStatus,
  MonthlyReport,
} from "@livestock-invest/shared-types";
import {
  LIVESTOCK_STATUS,
  formatDateUz,
  formatMonthUz,
  formatUzs,
  shortId,
} from "@/lib/uz";
import { StatusChip } from "@/components/dashboard/primitives";
import { StatusStepper } from "@/components/dashboard/StatusStepper";
import { useScrollLock } from "@/lib/useScrollLock";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="shrink-0 text-xs text-stone-500 dark:text-stone-400">{label}</dt>
      <dd className="truncate text-right text-sm font-medium tabular-nums text-stone-900 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

export function LivestockDetailDrawer({
  item,
  farm,
  reports,
  isLoadingReports,
  isBusy,
  onClose,
  onAdvance,
  onCancelListing,
  onAddReport,
}: {
  item: Livestock | null;
  farm?: Farm;
  reports?: MonthlyReport[];
  isLoadingReports: boolean;
  isBusy: boolean;
  onClose: () => void;
  onAdvance: (next: LivestockStatus) => void;
  onCancelListing: () => void;
  onAddReport: () => void;
}) {
  // Komponent har doim render bo'ladi — qulf faqat panel ochiq bo'lganda.
  useScrollLock(item !== null);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${item.breed ?? "Qo'zi"} kartasi`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white dark:border-stone-800 dark:bg-zinc-900"
          >
            <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-stone-900 dark:text-white">
                  {item.breed ?? "Zoti ko'rsatilmagan"}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                  #{shortId(item.id)}
                  <StatusChip
                    label={LIVESTOCK_STATUS[item.status].label}
                    colorVar={LIVESTOCK_STATUS[item.status].colorVar}
                    size="sm"
                  />
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Panelni yopish"
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Ma'lumotlar
                </h3>
                <dl className="divide-y divide-stone-100 dark:divide-stone-800">
                  <DetailRow label="Ferma" value={farm?.name ?? "—"} />
                  <DetailRow label="Joriy vazn" value={`${item.currentWeightKg} kg`} />
                  <DetailRow
                    label="Yoshi"
                    value={item.ageMonths != null ? `${item.ageMonths} oylik` : "—"}
                  />
                  <DetailRow label="Sarmoya narxi" value={formatUzs(item.priceUzs)} />
                  <DetailRow
                    label="Investor ulushi"
                    value={`${item.offeredInvestorSharePercent}%`}
                  />
                  <DetailRow
                    label="Rejadagi sotuv sanasi"
                    value={formatDateUz(item.expectedSaleDate)}
                  />
                  <DetailRow label="Qo'shilgan" value={formatDateUz(item.createdAt)} />
                </dl>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Holat zanjiri
                </h3>
                <StatusStepper
                  status={item.status}
                  isBusy={isBusy}
                  onAdvance={onAdvance}
                  onCancelListing={onCancelListing}
                />
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Oylik hisobotlar
                  </h3>
                  <button
                    type="button"
                    onClick={onAddReport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    <FilePlus className="h-3.5 w-3.5" /> Qo'shish
                  </button>
                </div>

                {isLoadingReports ? (
                  <p className="flex items-center gap-2 py-3 text-xs text-stone-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Hisobotlar
                    yuklanmoqda...
                  </p>
                ) : !reports || reports.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-stone-200 px-4 py-5 text-center text-xs text-stone-500 dark:border-stone-700 dark:text-stone-400">
                    Hali hisobot yuborilmagan. Har oy vazn hisobotini qo'shib borish
                    investor ishonchini oshiradi.
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {reports.map((report) => (
                      <li
                        key={report.id}
                        className="rounded-xl border border-stone-200 p-3 dark:border-stone-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-100">
                            <CalendarDays className="h-3.5 w-3.5 text-stone-400" />
                            {formatMonthUz(report.month)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                            <Scale className="h-3.5 w-3.5 text-stone-400" />
                            {report.weightKg} kg
                          </span>
                        </div>
                        {report.notes && (
                          <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                            {report.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
