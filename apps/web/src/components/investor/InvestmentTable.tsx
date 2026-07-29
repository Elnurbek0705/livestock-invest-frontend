"use client";

/**
 * Investor portfeli — jadval.
 *
 * Har bir bitim uchun kartochka o'rniga jadval: bitimlar soni o'sganda ham
 * ustunlar bir xil qoladi va qatorlarni ko'z bilan solishtirish mumkin.
 * Qidiruv, bosqich filtri va sahifalash bor.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Wallet, X } from "lucide-react";
import type { EscrowStatus, Investment, Livestock } from "@livestock-invest/shared-types";
import {
  ESCROW_PIPELINE,
  ESCROW_STAGE_COLOR,
  ESCROW_STATUS,
  formatDateShortUz,
  formatUzs,
  shortId,
} from "@/lib/uz";
import { EmptyState, StatusChip, controlClass } from "@/components/dashboard/primitives";

const PAGE_SIZE = 12;

export interface PortfolioRow {
  investment: Investment;
  livestock: Livestock | null;
  farmName: string | null;
}

export function InvestmentTable({ rows }: { rows: PortfolioRow[] }) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<EscrowStatus | "all">("all");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (stage !== "all" && row.investment.escrowStatus !== stage) return false;
      if (!needle) return true;
      return [
        row.livestock?.breed ?? "",
        row.farmName ?? "",
        shortId(row.investment.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, query, stage]);

  useEffect(() => {
    setPage(1);
  }, [query, stage]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilter = query.trim() !== "" || stage !== "all";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 dark:border-stone-800">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zot, ferma yoki bitim raqami"
            aria-label="Sarmoyalar orasidan qidirish"
            className={`${controlClass} w-full pl-9`}
          />
        </div>

        <select
          value={stage}
          onChange={(event) => setStage(event.target.value as EscrowStatus | "all")}
          aria-label="Bosqich bo'yicha filtr"
          className={controlClass}
        >
          <option value="all">Barcha bosqichlar</option>
          {[...ESCROW_PIPELINE, "refunded" as EscrowStatus].map((item) => (
            <option key={item} value={item}>
              {ESCROW_STATUS[item]}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStage("all");
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Tozalash
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={hasFilter ? "Mos bitim topilmadi" : "Hozircha sarmoyangiz yo'q"}
          description={
            hasFilter
              ? "Tanlangan shartlarga mos bitim yo'q. Filtrni kengaytirib ko'ring."
              : "Bozordan qo'zi tanlang — bitim shu yerda paydo bo'ladi."
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th scope="col" className="px-4 py-2.5 font-medium">Qo'zi</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Ferma</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Bosqich</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Sarmoya</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Ulush</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Sizning foydangiz
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Vazn</th>
                  <th scope="col" className="px-4 py-2.5">
                    <span className="sr-only">Batafsil</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ investment, livestock, farmName }) => (
                  <tr
                    key={investment.id}
                    className="border-b border-stone-100 last:border-0 dark:border-stone-800/70"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-stone-900 dark:text-white">
                        {livestock?.breed ?? "Zoti ko'rsatilmagan"}
                      </div>
                      <div className="text-xs tabular-nums text-stone-400">
                        #{shortId(investment.id)} ·{" "}
                        {formatDateShortUz(investment.createdAt)}
                      </div>
                    </td>
                    <td className="max-w-40 truncate px-4 py-2.5 text-stone-600 dark:text-stone-300">
                      {farmName ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusChip
                        label={ESCROW_STATUS[investment.escrowStatus]}
                        colorVar={ESCROW_STAGE_COLOR[investment.escrowStatus]}
                        size="sm"
                      />
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
                    <td className="px-4 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-200">
                      {livestock ? `${livestock.currentWeightKg} kg` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/investments/${investment.id}`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                      >
                        Batafsil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-stone-100 dark:divide-stone-800/70 lg:hidden">
            {pageRows.map(({ investment, livestock, farmName }) => (
              <li key={investment.id}>
                <Link
                  href={`/investments/${investment.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-sm font-medium text-stone-900 dark:text-white">
                      {livestock?.breed ?? "Zoti ko'rsatilmagan"}
                    </p>
                    <StatusChip
                      label={ESCROW_STATUS[investment.escrowStatus]}
                      colorVar={ESCROW_STAGE_COLOR[investment.escrowStatus]}
                      size="sm"
                    />
                    <p className="flex flex-wrap gap-x-2 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                      <span>{formatUzs(investment.amountUzs)}</span>
                      <span aria-hidden>·</span>
                      <span>{investment.contractProfitSharePercent}%</span>
                      {farmName && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="truncate">{farmName}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                </Link>
              </li>
            ))}
          </ul>

          {visible.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <span className="tabular-nums">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, visible.length)}
                </span>{" "}
                / jami <span className="tabular-nums">{visible.length}</span> ta
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Oldingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 text-xs tabular-nums text-stone-600 dark:text-stone-300">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= pageCount}
                  aria-label="Keyingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
