"use client";

/**
 * Bitimlar navbati.
 *
 * Ilgari uchta bosqich yonma-yon uchta ustunda turardi va har bir bitim
 * kichik kartochka edi — bitimlar ko'payganda ustunlar turli uzunlikda
 * cho'zilib, sahifa buzilardi. Endi bitta jadval va uning ustida bosqich
 * tanlagichi: ekranda har doim bitta navbat, bir xil ustunlar.
 */

import type { Investment } from "@livestock-invest/shared-types";
import { Coins, Inbox } from "lucide-react";
import { EmptyState } from "@/components/dashboard/primitives";
import { formatDateUz, formatUzs, shortId } from "@/lib/uz";

export type QueueKey = "escrow" | "sale" | "payout";

export interface QueueDefinition {
  key: QueueKey;
  label: string;
  /** Navbat nima uchun kutayotgani — jadval ustida bir qator */
  hint: string;
  actionLabel: string;
  items: Investment[];
}

export function InvestmentQueue({
  queues,
  active,
  onSelect,
  onAct,
  isBusy,
}: {
  queues: QueueDefinition[];
  active: QueueKey;
  onSelect: (key: QueueKey) => void;
  onAct: (queue: QueueKey, investment: Investment) => void;
  isBusy: boolean;
}) {
  const current = queues.find((queue) => queue.key === active) ?? queues[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 p-3 dark:border-stone-800">
        {queues.map((queue) => (
          <button
            key={queue.key}
            type="button"
            onClick={() => onSelect(queue.key)}
            aria-pressed={active === queue.key}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active === queue.key
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            {queue.label}{" "}
            <span className="tabular-nums opacity-70">{queue.items.length}</span>
          </button>
        ))}
      </div>

      <p className="border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500 dark:border-stone-800/70 dark:text-stone-400">
        {current.hint}
      </p>

      {current.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Navbat bo'sh"
          description="Bu bosqichda hozir sizdan amal talab qilinadigan bitim yo'q."
        />
      ) : (
        <>
          {/* Katta ekran: jadval */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th scope="col" className="px-4 py-2.5 font-medium">Bitim</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Sana</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Sarmoya</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Ulush</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Investor foydasi
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    <span className="sr-only">Amal</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {current.items.map((investment) => (
                  <tr
                    key={investment.id}
                    className="border-b border-stone-100 last:border-0 dark:border-stone-800/70"
                  >
                    <td className="px-4 py-2.5 font-medium tabular-nums text-stone-900 dark:text-white">
                      #{shortId(investment.id)}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600 dark:text-stone-300">
                      {formatDateUz(investment.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                      {formatUzs(investment.amountUzs)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                      {investment.contractProfitSharePercent}%
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                      {investment.investorShareUzs != null
                        ? formatUzs(investment.investorShareUzs)
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAct(current.key, investment)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {current.actionLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kichik ekran */}
          <ul className="divide-y divide-stone-100 dark:divide-stone-800/70 md:hidden">
            {current.items.map((investment) => (
              <li key={investment.id} className="space-y-2 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium tabular-nums text-stone-900 dark:text-white">
                    #{shortId(investment.id)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                    {formatUzs(investment.amountUzs)}
                  </span>
                </div>
                <p className="flex flex-wrap gap-x-2 text-xs text-stone-500 dark:text-stone-400">
                  <span>{formatDateUz(investment.createdAt)}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">
                    {investment.contractProfitSharePercent}%
                  </span>
                  {investment.investorShareUzs != null && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">
                        foyda {formatUzs(investment.investorShareUzs)}
                      </span>
                    </>
                  )}
                </p>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onAct(current.key, investment)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Coins className="h-3.5 w-3.5" />
                  {current.actionLabel}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
