"use client";

/**
 * Qo'zi holatini boshqarish — ochiladigan ro'yxat (dropdown) o'rniga
 * bir tomonlama qadamlar zanjiri.
 *
 * Nega dropdown emas: ro'yxat barcha holatlarni teng va qaytariladigan qilib
 * ko'rsatadi, aslida esa zanjir faqat oldinga yuradi. Bu yerda o'tib bo'lingan
 * qadam qulflanadi, kelgusi qadamlar esa o'chirilgan holatda turadi — fermerga
 * bir vaqtning o'zida faqat bitta haqiqiy amal taklif qilinadi.
 */

import { Check, Lock, ArrowRight, CircleSlash, Loader2 } from "lucide-react";
import type { LivestockStatus } from "@livestock-invest/shared-types";
import {
  FARMER_NEXT_STEP,
  LIVESTOCK_PIPELINE,
  LIVESTOCK_STATUS,
  WAITING_ON,
} from "@/lib/uz";

export function StatusStepper({
  status,
  onAdvance,
  onCancelListing,
  isBusy = false,
}: {
  status: LivestockStatus;
  onAdvance: (next: LivestockStatus) => void;
  onCancelListing?: () => void;
  isBusy?: boolean;
}) {
  const isCancelled = status === "cancelled";
  const currentIndex = LIVESTOCK_PIPELINE.indexOf(status);
  const nextStep = FARMER_NEXT_STEP[status];
  const waiting = WAITING_ON[status];

  return (
    <div className="space-y-4">
      {isCancelled ? (
        <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60">
          <CircleSlash className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
          <div>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              E'lon bekor qilingan
            </p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {LIVESTOCK_STATUS.cancelled.description}
            </p>
          </div>
        </div>
      ) : (
        <ol className="space-y-0">
          {LIVESTOCK_PIPELINE.map((step, index) => {
            const meta = LIVESTOCK_STATUS[step];
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === LIVESTOCK_PIPELINE.length - 1;

            return (
              <li key={step} className="flex gap-3">
                {/* Belgi ustuni va uni bog'lovchi chiziq */}
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone || isCurrent
                        ? "text-white"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                    style={{
                      backgroundColor:
                        isDone || isCurrent ? `var(${meta.colorVar})` : "var(--stage-idle)",
                    }}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  {!isLast && (
                    <span
                      className="w-0.5 flex-1"
                      style={{
                        minHeight: "1.5rem",
                        backgroundColor: isDone
                          ? `var(${meta.colorVar})`
                          : "var(--stage-idle)",
                      }}
                    />
                  )}
                </div>

                <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        isCurrent
                          ? "font-semibold text-stone-900 dark:text-white"
                          : isDone
                            ? "font-medium text-stone-600 dark:text-stone-300"
                            : "font-medium text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {meta.label}
                    </span>

                    {isCurrent && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Joriy
                      </span>
                    )}
                    {isDone && (
                      <Lock
                        className="h-3 w-3 text-stone-400"
                        aria-label="Bu qadam yakunlangan va qaytarilmaydi"
                      />
                    )}
                  </div>

                  {isCurrent && (
                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                      {meta.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Yagona haqiqiy amal — yoki kimni kutayotgani haqida izoh */}
      {nextStep && (
        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
            Keyingi qadam: <b className="text-stone-900 dark:text-white">
              {LIVESTOCK_STATUS[nextStep.to].label}
            </b>. Zanjir faqat oldinga yuradi — bu qadamdan keyin ortga qaytib bo'lmaydi.
          </p>
          <button
            type="button"
            onClick={() => onAdvance(nextStep.to)}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {nextStep.action}
          </button>
        </div>
      )}

      {!nextStep && waiting && (
        <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
          {waiting}
        </p>
      )}

      {status === "listed" && onCancelListing && (
        <button
          type="button"
          onClick={onCancelListing}
          disabled={isBusy}
          className="w-full rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-stone-700 dark:hover:border-red-900 dark:hover:bg-red-950/40"
        >
          E'lonni bekor qilish
        </button>
      )}
    </div>
  );
}
