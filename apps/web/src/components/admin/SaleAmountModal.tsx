"use client";

/**
 * Sotuv summasini kiritish.
 *
 * Summa kiritilgach backend foydani hisoblab, taqsimotni tayyorlaydi — bu
 * qadamni ortga qaytarib bo'lmaydi, shuning uchun forma taxminiy taqsimotni
 * oldindan ko'rsatadi: administrator raqamni tasdiqlashdan oldin ko'rib oladi.
 */

import { useState, type FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import type { Investment } from "@livestock-invest/shared-types";
import { Field, inputClass } from "@/components/dashboard/primitives";
import { ModalShell, ModalSubmitButton } from "@/components/dashboard/ModalShell";
import { formatUzs, shortId } from "@/lib/uz";

export function SaleAmountModal({
  investment,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  investment: Investment | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (saleAmountUzs: number) => void;
}) {
  const [amount, setAmount] = useState("");

  if (!investment) return null;

  const parsed = Number(amount);
  const isValid = Number.isFinite(parsed) && parsed > 0;
  const profit = isValid ? parsed - investment.amountUzs : 0;
  const investorShare =
    profit > 0
      ? Math.round(profit * (investment.contractProfitSharePercent / 100))
      : 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) onSubmit(parsed);
  };

  return (
    <AnimatePresence>
      <ModalShell
        title="Sotuv summasini kiritish"
        description={`Bitim #${shortId(investment.id)} · sarmoya ${formatUzs(investment.amountUzs)}`}
        onClose={onClose}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Bozordagi sotuv summasi (so'm)"
            hint="Chorva qancha summaga sotilgan bo'lsa, o'shani kiriting."
          >
            <input
              type="number"
              min={1}
              step={1000}
              required
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass}
            />
          </Field>

          {isValid && (
            <dl className="space-y-2 rounded-xl border border-stone-200 p-3 text-xs dark:border-stone-800">
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500 dark:text-stone-400">Sotuvdan foyda</dt>
                <dd
                  className={`font-semibold tabular-nums ${
                    profit > 0
                      ? "text-stone-900 dark:text-white"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {profit > 0 ? formatUzs(profit) : "Foyda yo'q"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500 dark:text-stone-400">
                  Investor ulushi ({investment.contractProfitSharePercent}%)
                </dt>
                <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatUzs(investorShare)}
                </dd>
              </div>
              <p className="pt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                Taxminiy hisob. Yakuniy taqsimotni platforma komissiyasi bilan birga
                backend hisoblaydi.
              </p>
            </dl>
          )}

          <ModalSubmitButton
            isSubmitting={isSubmitting}
            idleText="Sotuvni yakunlash"
            busyText="Saqlanmoqda..."
          />
        </form>
      </ModalShell>
    </AnimatePresence>
  );
}
