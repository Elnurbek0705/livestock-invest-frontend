"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Plus,
  Scale,
  Sprout,
  Wallet,
} from "lucide-react";
import { getApiClient } from "@livestock-invest/api-client";
import type {
  Farm,
  Livestock,
  LivestockStatus,
  MonthlyReport,
} from "@livestock-invest/shared-types";
import { useAuthStore } from "@/lib/authStore";
import { errorText } from "@/lib/apiError";
import { useToast } from "@/components/Toast/ToastProvider";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageTransition } from "@/components/PageTransition";
import {
  EmptyState,
  Panel,
  PanelHeader,
  SkeletonRows,
  StatTile,
  StatusChip,
} from "@/components/dashboard/primitives";
import {
  DashboardNav,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardNav";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import {
  EMPTY_FILTERS,
  LivestockTable,
  type TableFilters,
} from "@/components/farmer/LivestockTable";
import { LivestockDetailDrawer } from "@/components/farmer/LivestockDetailDrawer";
import {
  FarmFormModal,
  LivestockFormModal,
  MonthlyReportModal,
  type FarmInput,
  type LivestockInput,
  type ReportInput,
} from "@/components/farmer/FarmerModals";
import {
  FARM_VERIFICATION,
  LIVESTOCK_PIPELINE,
  LIVESTOCK_STATUS,
  REPORTABLE_STATUSES,
  currentMonthKey,
  formatMonthUz,
  formatUzsCompact,
  shortId,
} from "@/lib/uz";

type TabKey = "overview" | "livestock" | "farms" | "reports";

/** Tasdiqlanishi kutilayotgan amal — ConfirmModal orqali tasdiqlanadi */
type PendingAction =
  | { kind: "advance"; item: Livestock; to: LivestockStatus }
  | { kind: "cancel"; item: Livestock };

export default function FarmerDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);

  // ---- Ma'lumotlar --------------------------------------------------------
  const [farms, setFarms] = useState<Farm[]>([]);
  const [livestockList, setLivestockList] = useState<Livestock[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Skelet faqat birinchi yuklashda ko'rsatiladi. Har bir amaldan keyin
   * ma'lumot qayta so'raladi — o'shanda ham skelet chaqnasa, sahifa sakrab
   * ketadi. Shuning uchun keyingi yuklashlarda mavjud ko'rinish saqlanadi
   * va shunchaki xiralashadi.
   */
  const isLoading = !hasLoadedOnce;

  // ---- Interfeys holati ---------------------------------------------------
  const [tab, setTab] = useState<TabKey>("overview");
  const [filters, setFilters] = useState<TableFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showLivestockModal, setShowLivestockModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportListSize, setReportListSize] = useState(8);

  // ---- Oylik hisobotlar keshi --------------------------------------------
  const [reportsById, setReportsById] = useState<Record<string, MonthlyReport[]>>({});
  const [loadingReportIds, setLoadingReportIds] = useState<string[]>([]);
  const requestedReports = useRef<Set<string>>(new Set());

  const loadFarmerData = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const api = getApiClient();
      const [myFarms, myLivestock] = await Promise.all([
        api.farms.mine(),
        api.livestock.mine(),
      ]);
      setFarms(myFarms);
      setLivestockList(myLivestock);
    } catch (error) {
      setLoadError(errorText(error, "Ma'lumotlarni yuklab bo'lmadi"));
    } finally {
      setHasLoadedOnce(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "farmer") {
      router.push("/");
      return;
    }
    loadFarmerData();
  }, [isAuthInitialized, user, router, loadFarmerData]);

  /**
   * Hisobotlar faqat kerak bo'lganda va har bir qo'zi uchun bir martadan
   * yuklanadi — aks holda 100 ta qo'zi 100 ta so'rovga aylanadi.
   */
  const loadReports = useCallback(async (livestockId: string) => {
    if (requestedReports.current.has(livestockId)) return;
    requestedReports.current.add(livestockId);
    setLoadingReportIds((previous) => [...previous, livestockId]);
    try {
      const list = await getApiClient().livestock.getMonthlyReports(livestockId);
      setReportsById((previous) => ({ ...previous, [livestockId]: list }));
    } catch {
      // Muvaffaqiyatsiz so'rovni keshda qoldirmaymiz — keyin qayta urinilsin.
      requestedReports.current.delete(livestockId);
    } finally {
      setLoadingReportIds((previous) => previous.filter((id) => id !== livestockId));
    }
  }, []);

  const invalidateReports = useCallback((livestockId: string) => {
    requestedReports.current.delete(livestockId);
    setReportsById((previous) => {
      const next = { ...previous };
      delete next[livestockId];
      return next;
    });
  }, []);

  // ---- Hosila qiymatlar ---------------------------------------------------
  const approvedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus === "platform_approved"),
    [farms],
  );

  const farmById = useMemo(
    () => new Map(farms.map((farm) => [farm.id, farm])),
    [farms],
  );

  const selected = useMemo(
    () => livestockList.find((item) => item.id === selectedId) ?? null,
    [livestockList, selectedId],
  );

  const reportTarget = useMemo(
    () => livestockList.find((item) => item.id === reportTargetId) ?? null,
    [livestockList, reportTargetId],
  );

  const stats = useMemo(() => {
    const active = livestockList.filter((item) => item.status !== "cancelled");
    const inCare = livestockList.filter((item) =>
      (["funded", "in_care", "ready_for_sale"] as LivestockStatus[]).includes(item.status),
    );
    const listed = livestockList.filter((item) => item.status === "listed");
    const portfolioValue = active.reduce((sum, item) => sum + item.priceUzs, 0);
    const averageWeight =
      inCare.length > 0
        ? Math.round(
            inCare.reduce((sum, item) => sum + item.currentWeightKg, 0) / inCare.length,
          )
        : 0;

    return {
      total: livestockList.length,
      listed: listed.length,
      inCare: inCare.length,
      portfolioValue,
      averageWeight,
    };
  }, [livestockList]);

  const pipelineSlices = useMemo(
    () =>
      ([...LIVESTOCK_PIPELINE, "cancelled"] as LivestockStatus[]).map((status) => ({
        key: status,
        label: LIVESTOCK_STATUS[status].label,
        colorVar: LIVESTOCK_STATUS[status].colorVar,
        count: livestockList.filter((item) => item.status === status).length,
      })),
    [livestockList],
  );

  /** Bu oy hisobot kutilayotgan qo'zilar */
  const reportable = useMemo(
    () => livestockList.filter((item) => REPORTABLE_STATUSES.includes(item.status)),
    [livestockList],
  );

  const thisMonth = currentMonthKey();

  const readyToStartCare = useMemo(
    () => livestockList.filter((item) => item.status === "funded"),
    [livestockList],
  );

  const unverifiedFarms = useMemo(
    () => farms.filter((farm) => farm.verificationStatus !== "platform_approved"),
    [farms],
  );

  const visibleReportable = useMemo(
    () => reportable.slice(0, reportListSize),
    [reportable, reportListSize],
  );

  // "Hisobotlar" bo'limi ochilganda faqat ekrandagi qatorlar uchun yuklaymiz.
  useEffect(() => {
    if (tab !== "reports") return;
    visibleReportable.forEach((item) => void loadReports(item.id));
  }, [tab, visibleReportable, loadReports]);

  // Panel ochilganda o'sha qo'zining hisobotlarini yuklaymiz.
  useEffect(() => {
    if (selectedId) void loadReports(selectedId);
  }, [selectedId, loadReports]);

  // ---- Amallar ------------------------------------------------------------
  const handleCreateFarm = async (input: FarmInput) => {
    setIsSubmitting(true);
    try {
      await getApiClient().farms.create({
        name: input.name,
        region: input.region,
        district: input.district || undefined,
      });
      setShowFarmModal(false);
      toast.success(
        "Ferma saqlandi. Platforma tekshiruvidan so'ng qo'zi qo'sha olasiz.",
        "Ferma qo'shildi",
      );
      await loadFarmerData();
    } catch (error) {
      toast.error(errorText(error, "Ferma yaratishda xatolik"), "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLivestock = async (input: LivestockInput) => {
    if (!input.farmId) {
      toast.warning(
        "Qo'zi qo'shish uchun kamida bitta tasdiqlangan ferma kerak.",
        "Ferma tanlanmagan",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await getApiClient().livestock.create(input);
      setShowLivestockModal(false);
      toast.success("Yangi qo'zi e'loni bozorga chiqarildi.", "E'lon joylandi");
      await loadFarmerData();
    } catch (error) {
      toast.error(errorText(error, "Qo'zi qo'shishda xatolik"), "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReport = async (input: ReportInput) => {
    if (!reportTarget) return;
    setIsSubmitting(true);
    try {
      await getApiClient().livestock.addMonthlyReport(reportTarget.id, input);
      invalidateReports(reportTarget.id);
      setReportTargetId(null);
      toast.success("Oylik hisobot yuborildi.", "Hisobot saqlandi");
      await loadFarmerData();
      void loadReports(reportTarget.id);
    } catch (error) {
      toast.error(errorText(error, "Hisobot qo'shishda xatolik"), "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const nextStatus =
      pendingAction.kind === "advance" ? pendingAction.to : ("cancelled" as const);

    setIsSubmitting(true);
    try {
      await getApiClient().livestock.updateStatus(pendingAction.item.id, nextStatus);
      setPendingAction(null);
      toast.success(
        `Holat «${LIVESTOCK_STATUS[nextStatus].label}» ga o'tkazildi.`,
        "Bosqich yangilandi",
      );
      await loadFarmerData();
    } catch (error) {
      toast.error(errorText(error, "Holatni yangilashda xatolik"), "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLivestockFilteredBy = (status: LivestockStatus) => {
    setFilters({ ...EMPTY_FILTERS, status });
    setTab("livestock");
  };

  // ---- Ko'rinish ----------------------------------------------------------
  const navItems: DashboardNavItem<TabKey>[] = [
    { key: "overview", label: "Umumiy ko'rinish", icon: LayoutDashboard },
    { key: "livestock", label: "Qo'zilarim", icon: Sprout, badge: livestockList.length },
    { key: "farms", label: "Fermalarim", icon: Building2, badge: farms.length },
    {
      key: "reports",
      label: "Oylik hisobotlar",
      icon: ClipboardList,
      badge: reportable.length,
    },
  ];

  const addLivestockButton = (
    <button
      type="button"
      onClick={() => setShowLivestockModal(true)}
      disabled={approvedFarms.length === 0}
      title={
        approvedFarms.length === 0
          ? "Avval fermangiz platforma tomonidan tasdiqlanishi kerak"
          : undefined
      }
      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Sprout className="h-4 w-4" /> Qo'zi qo'shish
    </button>
  );

  return (
    <PageTransition>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Sahifa sarlavhasi */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Fermer kabineti
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
              {user?.fullName ?? "Xush kelibsiz"}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Fermalaringiz, qo'zilaringiz va oylik hisobotlaringiz bir joyda.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFarmModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-zinc-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" /> Ferma qo'shish
            </button>
            {addLivestockButton}
          </div>
        </div>

        {loadError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Ma'lumotlarni yuklab bo'lmadi</p>
              <p className="mt-0.5 text-xs">{loadError}</p>
              <button
                type="button"
                onClick={loadFarmerData}
                className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
              >
                Qayta urinish
              </button>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
          {/* Yon menyu — kichik ekranda gorizontal lenta */}
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
                    label="Jami qo'zilar"
                    value={String(stats.total)}
                    hint={`${stats.listed} tasi bozorda`}
                    icon={Sprout}
                  />
                  <StatTile
                    label="Parvarishda"
                    value={String(stats.inCare)}
                    hint="Sarmoya jalb qilingan va boqilmoqda"
                    icon={ClipboardList}
                  />
                  <StatTile
                    label="O'rtacha vazn"
                    value={stats.averageWeight > 0 ? `${stats.averageWeight} kg` : "—"}
                    hint="Parvarishdagi qo'zilar bo'yicha"
                    icon={Scale}
                  />
                  <StatTile
                    label="Portfel qiymati"
                    value={
                      stats.portfolioValue > 0
                        ? formatUzsCompact(stats.portfolioValue)
                        : "—"
                    }
                    hint="Bekor qilinganlardan tashqari"
                    icon={Wallet}
                    accent
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Panel>
                    <PanelHeader
                      icon={LayoutDashboard}
                      title="Bosqichlar bo'yicha taqsimot"
                      subtitle="Bo'lakni bosing — o'sha holatdagi qo'zilar ro'yxati ochiladi"
                    />
                    {isLoading ? (
                      <SkeletonRows rows={3} />
                    ) : (
                      <PipelineBar
                        slices={pipelineSlices}
                        activeKey={filters.status}
                        onSelect={(key) => openLivestockFilteredBy(key as LivestockStatus)}
                      />
                    )}
                  </Panel>

                  <Panel>
                    <PanelHeader
                      icon={AlertTriangle}
                      title="Sizning e'tiboringizni kutmoqda"
                      subtitle="Navbat sizda bo'lgan ishlar"
                    />
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {unverifiedFarms.length > 0 && (
                        <AttentionRow
                          title={`${unverifiedFarms.length} ta ferma hali tasdiqlanmagan`}
                          description="Tasdiqlanmagan fermaga qo'zi qo'shib bo'lmaydi."
                          actionLabel="Fermalarni ko'rish"
                          onAction={() => setTab("farms")}
                        />
                      )}
                      {readyToStartCare.length > 0 && (
                        <AttentionRow
                          title={`${readyToStartCare.length} ta qo'zi sarmoya oldi`}
                          description="Parvarishni boshlang — investorlar hisobot kutmoqda."
                          actionLabel="Ro'yxatni ochish"
                          onAction={() => openLivestockFilteredBy("funded")}
                        />
                      )}
                      {reportable.length > 0 && (
                        <AttentionRow
                          title={`${reportable.length} ta qo'zi bo'yicha oylik hisobot yuritiladi`}
                          description={`Joriy oy: ${formatMonthUz(thisMonth)}.`}
                          actionLabel="Hisobotlarga o'tish"
                          onAction={() => setTab("reports")}
                        />
                      )}
                      {unverifiedFarms.length === 0 &&
                        readyToStartCare.length === 0 &&
                        reportable.length === 0 &&
                        !isLoading && (
                          <p className="px-5 py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                            Hozircha sizdan talab qilinadigan amal yo'q.
                          </p>
                        )}
                    </div>
                  </Panel>
                </div>
              </>
            )}

            {/* ---------------- Qo'zilar jadvali ---------------- */}
            {tab === "livestock" && (
              <Panel>
                <PanelHeader
                  icon={Sprout}
                  title="Qo'zilarim"
                  subtitle="Qatorni bosing — boshqaruv paneli ochiladi"
                  action={addLivestockButton}
                />
                {isLoading ? (
                  <SkeletonRows rows={6} />
                ) : (
                  <LivestockTable
                    items={livestockList}
                    farms={farms}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onOpen={(item) => setSelectedId(item.id)}
                    emptyAction={approvedFarms.length > 0 ? addLivestockButton : undefined}
                  />
                )}
              </Panel>
            )}

            {/* ---------------- Fermalar ---------------- */}
            {tab === "farms" && (
              <Panel>
                <PanelHeader
                  icon={Building2}
                  title="Fermalarim"
                  subtitle="Qo'zi qo'shish uchun ferma platforma tomonidan tasdiqlangan bo'lishi kerak"
                  action={
                    <button
                      type="button"
                      onClick={() => setShowFarmModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <Plus className="h-4 w-4" /> Qo'shish
                    </button>
                  }
                />
                {isLoading ? (
                  <SkeletonRows rows={3} />
                ) : farms.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Hozircha fermangiz yo'q"
                    description="Birinchi fermangizni ro'yxatdan o'tkazing. Platforma tekshiruvidan so'ng qo'zi qo'sha olasiz."
                    action={
                      <button
                        type="button"
                        onClick={() => setShowFarmModal(true)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        Ferma qo'shish
                      </button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                    {farms.map((farm) => {
                      const meta = FARM_VERIFICATION[farm.verificationStatus];
                      const count = livestockList.filter(
                        (item) => item.farmId === farm.id,
                      ).length;
                      return (
                        <li
                          key={farm.id}
                          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                                {farm.name}
                              </h3>
                              <span className="text-xs tabular-nums text-stone-400">
                                ★ {farm.rating}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                              {farm.region}
                              {farm.district ? `, ${farm.district}` : ""} ·{" "}
                              <span className="tabular-nums">{count}</span> ta qo'zi
                            </p>
                            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                              {meta.description}
                            </p>
                          </div>
                          <StatusChip
                            label={meta.label}
                            colorVar={
                              meta.tone === "done"
                                ? "--stage-3"
                                : meta.tone === "progress"
                                  ? "--stage-1"
                                  : "--stage-off"
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            )}

            {/* ---------------- Oylik hisobotlar ---------------- */}
            {tab === "reports" && (
              <Panel>
                <PanelHeader
                  icon={ClipboardList}
                  title="Oylik hisobotlar"
                  subtitle={`Joriy oy: ${formatMonthUz(thisMonth)} · ${reportable.length} ta qo'zi bo'yicha hisobot yuritiladi`}
                />
                {isLoading ? (
                  <SkeletonRows rows={5} />
                ) : reportable.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="Hisobot talab qilinadigan qo'zi yo'q"
                    description="Oylik hisobot faqat sarmoya jalb qilingan va parvarishdagi qo'zilar uchun yuritiladi."
                  />
                ) : (
                  <>
                    <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                      {visibleReportable.map((item) => {
                        const list = reportsById[item.id];
                        const isLoadingRow = loadingReportIds.includes(item.id);
                        const hasThisMonth = list?.some(
                          (report) => report.month === thisMonth,
                        );
                        const latest = list?.[0];

                        return (
                          <li
                            key={item.id}
                            className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setSelectedId(item.id)}
                                className="text-sm font-medium text-stone-900 hover:underline dark:text-white"
                              >
                                {item.breed ?? "Zoti ko'rsatilmagan"}
                                <span className="ml-2 text-xs tabular-nums font-normal text-stone-400">
                                  #{shortId(item.id)}
                                </span>
                              </button>
                              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                {farmById.get(item.farmId)?.name ?? "—"} ·{" "}
                                <span className="tabular-nums">
                                  {item.currentWeightKg} kg
                                </span>{" "}
                                ·{" "}
                                {isLoadingRow
                                  ? "hisobotlar yuklanmoqda..."
                                  : latest
                                    ? `so'nggi hisobot: ${formatMonthUz(latest.month)}`
                                    : "hali hisobot yo'q"}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {!isLoadingRow && list && (
                                <StatusChip
                                  label={
                                    hasThisMonth ? "Bu oy yuborilgan" : "Bu oy kutilmoqda"
                                  }
                                  colorVar={hasThisMonth ? "--stage-3" : "--stage-off"}
                                  size="sm"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => setReportTargetId(item.id)}
                                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                Hisobot qo'shish
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {reportListSize < reportable.length && (
                      <div className="border-t border-stone-200 p-3 text-center dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => setReportListSize((size) => size + 8)}
                          className="rounded-xl px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                        >
                          Yana {Math.min(8, reportable.length - reportListSize)} tasini
                          ko'rsatish
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Panel>
            )}
          </div>
        </div>
      </main>

      {/* ---------------- Panellar va modallar ---------------- */}
      <LivestockDetailDrawer
        item={selected}
        farm={selected ? farmById.get(selected.farmId) : undefined}
        reports={selected ? reportsById[selected.id] : undefined}
        isLoadingReports={selected ? loadingReportIds.includes(selected.id) : false}
        isBusy={isSubmitting}
        onClose={() => setSelectedId(null)}
        onAdvance={(to) =>
          selected && setPendingAction({ kind: "advance", item: selected, to })
        }
        onCancelListing={() =>
          selected && setPendingAction({ kind: "cancel", item: selected })
        }
        onAddReport={() => selected && setReportTargetId(selected.id)}
      />

      <FarmFormModal
        isOpen={showFarmModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowFarmModal(false)}
        onSubmit={handleCreateFarm}
      />

      <LivestockFormModal
        isOpen={showLivestockModal}
        isSubmitting={isSubmitting}
        approvedFarms={approvedFarms}
        onClose={() => setShowLivestockModal(false)}
        onSubmit={handleCreateLivestock}
      />

      <MonthlyReportModal
        target={reportTarget}
        isSubmitting={isSubmitting}
        onClose={() => setReportTargetId(null)}
        onSubmit={handleAddReport}
      />

      {pendingAction && (
        <ConfirmModal
          isOpen
          type={pendingAction.kind === "cancel" ? "danger" : "warning"}
          title={
            pendingAction.kind === "cancel"
              ? "E'lonni bekor qilasizmi?"
              : `«${LIVESTOCK_STATUS[pendingAction.to].label}» bosqichiga o'tasizmi?`
          }
          description={
            pendingAction.kind === "cancel"
              ? "E'lon bozordan olib tashlanadi va uni qayta tiklab bo'lmaydi. Bekor qilingan qo'zini qaytadan sotuvga qo'yish uchun yangi e'lon yaratishingiz kerak bo'ladi."
              : "Bu qadamdan keyin ortga qaytib bo'lmaydi — zanjir faqat oldinga yuradi. Davom etasizmi?"
          }
          confirmText={
            pendingAction.kind === "cancel" ? "Ha, bekor qilinsin" : "Ha, davom etaman"
          }
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </PageTransition>
  );
}

function AttentionRow({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
      >
        {actionLabel}
      </button>
    </div>
  );
}
