"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Coins,
  LayoutDashboard,
  PieChart,
  Scale,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getApiClient } from "@livestock-invest/api-client";
import type {
  EscrowStatus,
  Farm,
  Investment,
  Livestock,
  MonthlyReport,
} from "@livestock-invest/shared-types";
import { useAuthStore } from "@/lib/authStore";
import { errorText } from "@/lib/apiError";
import { latestReportPerMonth } from "@/lib/reports";
import { PageTransition } from "@/components/PageTransition";
import {
  EmptyState,
  Panel,
  PanelHeader,
  SkeletonRows,
  StatTile,
} from "@/components/dashboard/primitives";
import {
  DashboardNav,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardNav";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { WeightTrendChart } from "@/components/dashboard/charts/WeightTrendChart";
import { SplitBar } from "@/components/dashboard/charts/SplitBar";
import {
  InvestmentTable,
  type PortfolioRow,
} from "@/components/investor/InvestmentTable";
import {
  ESCROW_DESCRIPTION,
  ESCROW_PIPELINE,
  ESCROW_STAGE_COLOR,
  ESCROW_STATUS,
  formatDateShortUz,
  formatMonthUz,
  formatUzsCompact,
  shortId,
} from "@/lib/uz";

type TabKey = "overview" | "portfolio" | "reports";

export default function MyInvestmentsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [livestockById, setLivestockById] = useState<Record<string, Livestock>>({});
  const [farms, setFarms] = useState<Farm[]>([]);
  const [reportsById, setReportsById] = useState<Record<string, MonthlyReport[]>>({});
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabKey>("overview");

  const isLoading = !hasLoadedOnce;

  const loadPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const api = getApiClient();
      const [myInvestments, farmList] = await Promise.all([
        api.investments.listMine(),
        api.farms.list(),
      ]);
      setInvestments(myInvestments);
      setFarms(farmList);

      /**
       * Qo'zi va uning hisobotlari bitim yozuvida yo'q — har biri alohida
       * so'raladi. Bitimlar ko'p bo'lsa bu ko'p so'rov degani, shuning uchun
       * `livestockId` lar takrorlanmasligi uchun avval yagona ro'yxatga
       * yig'iladi va hammasi bir vaqtda yuboriladi.
       */
      const uniqueIds = [...new Set(myInvestments.map((item) => item.livestockId))];
      const details = await Promise.all(
        uniqueIds.map(async (id) => ({
          id,
          livestock: await api.livestock.getById(id).catch(() => null),
          reports: await api.livestock.getMonthlyReports(id).catch(() => []),
        })),
      );

      setLivestockById(
        Object.fromEntries(
          details
            .filter((item) => item.livestock)
            .map((item) => [item.id, item.livestock as Livestock]),
        ),
      );
      setReportsById(
        Object.fromEntries(details.map((item) => [item.id, item.reports])),
      );
    } catch (error) {
      setLoadError(errorText(error, "Portfel ma'lumotlarini yuklab bo'lmadi"));
    } finally {
      setHasLoadedOnce(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!user) {
      router.push("/login?redirect=/investments/mine");
      return;
    }
    loadPortfolio();
  }, [isAuthInitialized, user, router, loadPortfolio]);

  // ---- Hosila qiymatlar ---------------------------------------------------
  const farmNameById = useMemo(
    () => new Map(farms.map((farm) => [farm.id, farm.name])),
    [farms],
  );

  const rows: PortfolioRow[] = useMemo(
    () =>
      investments.map((investment) => {
        const livestock = livestockById[investment.livestockId] ?? null;
        return {
          investment,
          livestock,
          farmName: livestock ? (farmNameById.get(livestock.farmId) ?? null) : null,
        };
      }),
    [investments, livestockById, farmNameById],
  );

  const stats = useMemo(() => {
    const invested = investments.reduce((sum, item) => sum + item.amountUzs, 0);
    const paidOut = investments
      .filter((item) => item.escrowStatus === "payout_completed")
      .reduce((sum, item) => sum + (item.investorShareUzs ?? 0), 0);
    const active = investments.filter(
      (item) =>
        item.escrowStatus !== "payout_completed" && item.escrowStatus !== "refunded",
    ).length;
    const portfolioWeight = Object.values(livestockById).reduce(
      (sum, item) => sum + item.currentWeightKg,
      0,
    );

    return { invested, paidOut, active, portfolioWeight };
  }, [investments, livestockById]);

  const stageSlices = useMemo(
    () =>
      ([...ESCROW_PIPELINE, "refunded" as EscrowStatus]).map((status) => ({
        key: status,
        label: ESCROW_STATUS[status],
        colorVar: ESCROW_STAGE_COLOR[status],
        count: investments.filter((item) => item.escrowStatus === status).length,
      })),
    [investments],
  );

  /** Yakunlangan sotuvlar bo'yicha jami taqsimot */
  const distribution = useMemo(() => {
    const completed = investments.filter((item) => item.saleAmountUzs != null);
    if (completed.length === 0) return null;
    return {
      count: completed.length,
      saleTotal: completed.reduce((sum, item) => sum + (item.saleAmountUzs ?? 0), 0),
      investor: completed.reduce((sum, item) => sum + (item.investorShareUzs ?? 0), 0),
      farmer: completed.reduce((sum, item) => sum + (item.farmerShareUzs ?? 0), 0),
      platform: completed.reduce((sum, item) => sum + (item.platformFeeUzs ?? 0), 0),
    };
  }, [investments]);

  /**
   * Investor egalik qiladigan qo'zilar — bitimlar emas.
   *
   * Bitta qo'ziga bir nechta bitim bo'lishi mumkin, hisobotlar esa qo'ziga
   * biriktirilgan. Shuning uchun grafik ham, hisobotlar oqimi ham bitimlar
   * bo'yicha emas, qo'zilar bo'yicha quriladi — aks holda ayni hisobot bir
   * necha marta takrorlanadi.
   */
  const holdings = useMemo(() => {
    const byLivestock = new Map<
      string,
      { livestockId: string; title: string; farmName: string | null }
    >();
    for (const row of rows) {
      const id = row.investment.livestockId;
      if (byLivestock.has(id)) continue;
      byLivestock.set(id, {
        livestockId: id,
        title: row.livestock?.breed ?? `Qo'zi #${shortId(id)}`,
        farmName: row.farmName,
      });
    }
    return [...byLivestock.values()];
  }, [rows]);

  const weightPanels = useMemo(
    () =>
      holdings
        .map((holding) => ({
          id: holding.livestockId,
          title: holding.title,
          subtitle: holding.farmName ?? undefined,
          points: latestReportPerMonth(reportsById[holding.livestockId] ?? []).map(
            (report) => ({ month: report.month, weightKg: report.weightKg }),
          ),
        }))
        .filter((panel) => panel.points.length > 0),
    [holdings, reportsById],
  );

  /** Barcha qo'zilarning oylik hisobotlari — eng yangisi birinchi */
  const reportFeed = useMemo(
    () =>
      holdings
        .flatMap((holding) =>
          (reportsById[holding.livestockId] ?? []).map((report) => ({
            report,
            title: holding.title,
            farmName: holding.farmName,
          })),
        )
        .sort((a, b) => b.report.month.localeCompare(a.report.month)),
    [holdings, reportsById],
  );

  const navItems: DashboardNavItem<TabKey>[] = [
    { key: "overview", label: "Umumiy ko'rinish", icon: LayoutDashboard },
    { key: "portfolio", label: "Sarmoyalarim", icon: Wallet, badge: investments.length },
    {
      key: "reports",
      label: "Oylik hisobotlar",
      icon: ClipboardList,
      badge: reportFeed.length,
    },
  ];

  const isEmpty = !isLoading && investments.length === 0;

  return (
    <PageTransition>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Investor kabineti
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            {user?.fullName ?? "Portfelim"}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Sarmoyangiz qaysi bosqichda turgani va qo'zilaringiz qanday o'sayotgani.
          </p>
        </div>

        {loadError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Ma'lumotlarni yuklab bo'lmadi</p>
              <p className="mt-0.5 text-xs">{loadError}</p>
              <button
                type="button"
                onClick={loadPortfolio}
                className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
              >
                Qayta urinish
              </button>
            </div>
          </div>
        )}

        {isEmpty ? (
          <Panel>
            <EmptyState
              icon={ShoppingBag}
              title="Sizda hali sarmoya yo'q"
              description="Bozordan qo'zi tanlang — sarmoyangiz kafolat hisobiga o'tadi va uning har bir bosqichi shu sahifada ko'rinadi."
              action={
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Bozorni ochish
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </Panel>
        ) : (
          <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
            <DashboardNav items={navItems} active={tab} onSelect={setTab} />

            <div
              className={`min-w-0 space-y-6 transition-opacity duration-200 ${
                isRefreshing && hasLoadedOnce ? "opacity-60" : "opacity-100"
              }`}
            >
              {/* ---------------- Umumiy ko'rinish ---------------- */}
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <StatTile
                      icon={Coins}
                      label="Jami sarmoya"
                      value={stats.invested > 0 ? formatUzsCompact(stats.invested) : "—"}
                      hint={`${investments.length} ta bitim`}
                      accent
                    />
                    <StatTile
                      icon={Wallet}
                      label="Faol bitimlar"
                      value={String(stats.active)}
                      hint="Hali yakunlanmagan"
                    />
                    <StatTile
                      icon={TrendingUp}
                      label="Qo'lga tekkan foyda"
                      value={stats.paidOut > 0 ? formatUzsCompact(stats.paidOut) : "—"}
                      hint="To'lovi yakunlangan bitimlardan"
                    />
                    <StatTile
                      icon={Scale}
                      label="Portfel vazni"
                      value={
                        stats.portfolioWeight > 0 ? `${stats.portfolioWeight} kg` : "—"
                      }
                      hint="Qo'zilaringizning joriy vazni"
                    />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <Panel>
                      <PanelHeader
                        icon={PieChart}
                        title="Sarmoyam qayerda"
                        subtitle="Bitimlarning escrow bosqichlari bo'yicha taqsimoti"
                      />
                      {isLoading ? (
                        <SkeletonRows rows={3} />
                      ) : (
                        <>
                          <PipelineBar slices={stageSlices} />
                          {/* Bosqich nomi o'zi hamma narsani aytmaydi — pul
                              aynan qayerda turganini bir jumlada tushuntiramiz. */}
                          <dl className="space-y-2 border-t border-stone-100 px-5 py-4 dark:border-stone-800">
                            {stageSlices
                              .filter((slice) => slice.count > 0)
                              .map((slice) => (
                                <div key={slice.key} className="text-xs">
                                  <dt className="font-medium text-stone-700 dark:text-stone-200">
                                    {slice.label}
                                  </dt>
                                  <dd className="mt-0.5 leading-relaxed text-stone-500 dark:text-stone-400">
                                    {ESCROW_DESCRIPTION[slice.key as EscrowStatus]}
                                  </dd>
                                </div>
                              ))}
                          </dl>
                        </>
                      )}
                    </Panel>

                    <Panel>
                      <PanelHeader
                        icon={Coins}
                        title="Sotuvdan tushum qanday bo'lindi"
                        subtitle={
                          distribution
                            ? `${distribution.count} ta yakunlangan sotuv · jami ${formatUzsCompact(distribution.saleTotal)}`
                            : "Yakunlangan sotuvlar bo'yicha"
                        }
                      />
                      {isLoading ? (
                        <SkeletonRows rows={3} />
                      ) : distribution ? (
                        <SplitBar
                          caption="Sotuvdan tushgan mablag'ning taraflar o'rtasidagi taqsimoti."
                          segments={[
                            {
                              key: "investor",
                              label: "Sizning ulushingiz",
                              value: distribution.investor,
                              colorVar: "--chart-cat-1",
                            },
                            {
                              key: "farmer",
                              label: "Fermer ulushi",
                              value: distribution.farmer,
                              colorVar: "--chart-cat-2",
                            },
                            {
                              key: "platform",
                              label: "Platforma komissiyasi",
                              value: distribution.platform,
                              colorVar: "--chart-cat-3",
                            },
                          ]}
                        />
                      ) : (
                        <EmptyState
                          icon={Coins}
                          title="Hali yakunlangan sotuv yo'q"
                          description="Birinchi qo'zi sotilgach, tushumning qanday taqsimlangani shu yerda ko'rinadi."
                        />
                      )}
                    </Panel>
                  </div>

                  <Panel>
                    <PanelHeader
                      icon={Scale}
                      title="Qo'zilaringiz vazn dinamikasi"
                      subtitle="Fermer yuborgan oylik o'lchovlar"
                    />
                    {isLoading ? (
                      <SkeletonRows rows={4} />
                    ) : weightPanels.length === 0 ? (
                      <EmptyState
                        icon={Scale}
                        title="Hali vazn hisoboti yo'q"
                        description="Parvarish boshlangach fermer har oy vazn o'lchovini yuboradi va o'sish grafigi shu yerda chiziladi."
                      />
                    ) : (
                      <WeightTrendChart panels={weightPanels} />
                    )}
                  </Panel>
                </>
              )}

              {/* ---------------- Sarmoyalarim ---------------- */}
              {tab === "portfolio" && (
                <Panel className="overflow-hidden">
                  <PanelHeader
                    icon={Wallet}
                    title="Sarmoyalarim"
                    subtitle="Har bir bitimning bosqichi va moliyaviy holati"
                  />
                  {isLoading ? <SkeletonRows rows={6} /> : <InvestmentTable rows={rows} />}
                </Panel>
              )}

              {/* ---------------- Oylik hisobotlar ---------------- */}
              {tab === "reports" && (
                <Panel className="overflow-hidden">
                  <PanelHeader
                    icon={ClipboardList}
                    title="Oylik hisobotlar"
                    subtitle="Fermer yuborgan vazn o'lchovlari va izohlar"
                  />
                  {isLoading ? (
                    <SkeletonRows rows={5} />
                  ) : reportFeed.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="Hisobotlar hali yo'q"
                      description="Parvarish bosqichi boshlangach, har oy vazn hisoboti shu yerga tushadi."
                    />
                  ) : (
                    <ul className="divide-y divide-stone-100 dark:divide-stone-800/70">
                      {reportFeed.map(({ report, title, farmName }) => (
                        <li key={report.id} className="px-5 py-3.5">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-sm font-medium text-stone-900 dark:text-white">
                              {title}
                              {farmName && (
                                <span className="ml-2 text-xs font-normal text-stone-500 dark:text-stone-400">
                                  {farmName}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {formatMonthUz(report.month)} ·{" "}
                              <span className="font-semibold tabular-nums text-stone-800 dark:text-stone-100">
                                {report.weightKg} kg
                              </span>
                            </p>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                            {report.notes}
                          </p>
                          <p className="mt-1 text-[11px] text-stone-400">
                            Yuborilgan: {formatDateShortUz(report.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              )}

              <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                Ko'rsatilgan ulush foizi — shartnoma bo'yicha foyda taqsimoti ulushi.
                Yakuniy summa qo'zining vazn o'sishiga va sotuv narxiga bog'liq;
                kafolatlangan daromad emas.
              </p>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
