"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Coins,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import { getApiClient } from "@livestock-invest/api-client";
import type {
  AdminDashboard,
  AdminVetRow,
  Farm,
  Investment,
  User,
  UserRole,
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
import {
  InvestmentQueue,
  type QueueDefinition,
  type QueueKey,
} from "@/components/admin/InvestmentQueue";
import { UsersTable } from "@/components/admin/UsersTable";
import { VetsTable } from "@/components/admin/VetsTable";
import { SaleAmountModal } from "@/components/admin/SaleAmountModal";
import {
  FARM_VERIFICATION,
  USER_ROLE,
  formatUzsCompact,
} from "@/lib/uz";

type TabKey = "overview" | "farms" | "investments" | "vets" | "users";

/**
 * Tasdiqlash kutayotgan amal.
 *
 * Bu yerdagi amallarning barchasi pul yoki huquq bilan bog'liq va ortga
 * qaytmaydi, shuning uchun hech biri to'g'ridan-to'g'ri bajarilmaydi —
 * avval ConfirmModal ochiladi. Ilgari brauzerning `confirm()` va `alert()`
 * oynalari ishlatilgan edi; ular kabinetning qolgan qismidan uzilib turardi.
 */
type PendingAction =
  | { kind: "verifyFarm"; farm: Farm; approve: boolean }
  | { kind: "releaseEscrow"; investment: Investment }
  | { kind: "completePayout"; investment: Investment }
  | { kind: "changeRole"; user: User; role: UserRole }
  | { kind: "verifyVet"; vet: AdminVetRow; verify: boolean };

export default function AdminDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [vets, setVets] = useState<AdminVetRow[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabKey>("overview");
  const [queue, setQueue] = useState<QueueKey>("escrow");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [saleTarget, setSaleTarget] = useState<Investment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = !hasLoadedOnce;

  const loadAdminData = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const api = getApiClient();
      const [dashboardData, userList, vetList] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.listUsers(),
        api.admin.listVets(),
      ]);
      setDashboard(dashboardData);
      setUsers(userList);
      setVets(vetList);
    } catch (error) {
      setLoadError(errorText(error, "Admin ma'lumotlarini yuklab bo'lmadi"));
    } finally {
      setHasLoadedOnce(true);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.role !== "admin") {
      router.push("/");
      return;
    }
    loadAdminData();
  }, [isAuthInitialized, currentUser, router, loadAdminData]);

  // ---- Hosila qiymatlar ---------------------------------------------------
  const queues: QueueDefinition[] = useMemo(() => {
    const investments = dashboard?.investments;
    return [
      {
        key: "escrow",
        label: "Escrow chiqarish",
        hint: "Fermer parvarishni boshladi — kafolat hisobidagi pulni unga o'tkazish mumkin.",
        actionLabel: "Fermerga o'tkazish",
        items: investments?.awaitingEscrowRelease ?? [],
      },
      {
        key: "sale",
        label: "Sotuvni yakunlash",
        hint: "Chorva sotuvga tayyor — bozordagi sotuv summasini kiritish kerak.",
        actionLabel: "Sotuv summasi",
        items: investments?.awaitingSaleCompletion ?? [],
      },
      {
        key: "payout",
        label: "Foydani taqsimlash",
        hint: "Sotuv yakunlandi — foydani investor va fermer o'rtasida taqsimlash qoldi.",
        actionLabel: "Taqsimlash",
        items: investments?.awaitingPayout ?? [],
      },
    ];
  }, [dashboard]);

  const queueTotal = useMemo(
    () => queues.reduce((sum, item) => sum + item.items.length, 0),
    [queues],
  );

  const pendingFarms = dashboard?.farms.pending ?? [];
  const pendingKycCount = dashboard?.kyc.pendingCount ?? 0;
  const pendingVetCount = useMemo(
    () => vets.filter((row) => !row.profile?.isLicenseVerified).length,
    [vets],
  );

  // ---- Amallar ------------------------------------------------------------
  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    fallbackError: string,
  ) => {
    setIsSubmitting(true);
    try {
      await action();
      setPendingAction(null);
      setSaleTarget(null);
      toast.success(successMessage, "Bajarildi");
      await loadAdminData();
    } catch (error) {
      toast.error(errorText(error, fallbackError), "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
    const api = getApiClient();

    switch (pendingAction.kind) {
      case "verifyFarm":
        return runAction(
          () =>
            api.farms.verify(
              pendingAction.farm.id,
              pendingAction.approve ? "platform_approved" : "rejected",
            ),
          pendingAction.approve
            ? `«${pendingAction.farm.name}» tasdiqlandi.`
            : `«${pendingAction.farm.name}» rad etildi.`,
          "Fermani tekshirishda xatolik",
        );
      case "releaseEscrow":
        return runAction(
          () => api.investments.releaseToFarmer(pendingAction.investment.id),
          "Kafolat hisobidagi mablag' fermerga o'tkazildi.",
          "Escrow chiqarishda xatolik",
        );
      case "completePayout":
        return runAction(
          () => api.investments.completePayout(pendingAction.investment.id),
          "Foyda taqsimoti yakunlandi.",
          "Taqsimotda xatolik",
        );
      case "changeRole":
        return runAction(
          () => api.admin.updateUserRole(pendingAction.user.id, pendingAction.role),
          `${pendingAction.user.fullName} endi ${USER_ROLE[pendingAction.role]}.`,
          "Rolni o'zgartirishda xatolik",
        );
      case "verifyVet":
        return runAction(
          () =>
            api.admin.verifyVetLicense(
              pendingAction.vet.user.id,
              pendingAction.verify,
            ),
          pendingAction.verify
            ? `${pendingAction.vet.user.fullName} litsenziyasi tasdiqlandi.`
            : `${pendingAction.vet.user.fullName} litsenziyasi bekor qilindi.`,
          "Litsenziyani o'zgartirishda xatolik",
        );
    }
  };

  const handleQueueAction = (key: QueueKey, investment: Investment) => {
    if (key === "escrow") setPendingAction({ kind: "releaseEscrow", investment });
    else if (key === "payout") setPendingAction({ kind: "completePayout", investment });
    else setSaleTarget(investment);
  };

  const confirmCopy = useMemo(() => {
    if (!pendingAction) return null;
    switch (pendingAction.kind) {
      case "verifyFarm":
        return pendingAction.approve
          ? {
              type: "success" as const,
              title: `«${pendingAction.farm.name}» tasdiqlansinmi?`,
              description:
                "Ferma tasdiqlangach fermer bozorga qo'zi e'lonlarini joylashtira boshlaydi.",
              confirmText: "Ha, tasdiqlansin",
            }
          : {
              type: "danger" as const,
              title: `«${pendingAction.farm.name}» rad etilsinmi?`,
              description:
                "Ferma rad etiladi va fermer qo'zi qo'sha olmaydi. Qarorni fermerga sabab bilan yetkazish tavsiya etiladi.",
              confirmText: "Ha, rad etilsin",
            };
      case "releaseEscrow":
        return {
          type: "warning" as const,
          title: "Mablag' fermerga o'tkazilsinmi?",
          description:
            "Kafolat hisobidagi pul fermerga o'tadi. Bu pul harakatini ortga qaytarib bo'lmaydi.",
          confirmText: "Ha, o'tkazilsin",
        };
      case "completePayout":
        return {
          type: "warning" as const,
          title: "Foyda taqsimlansinmi?",
          description:
            "Investor va fermer ulushlari hisoblariga o'tkaziladi. Bu qadam yakuniy — ortga qaytarilmaydi.",
          confirmText: "Ha, taqsimlansin",
        };
      case "verifyVet":
        return pendingAction.verify
          ? {
              type: "success" as const,
              title: "Litsenziya tasdiqlansinmi?",
              description: `${pendingAction.vet.user.fullName} (${pendingAction.vet.profile?.licenseNumber}) tasdiqlangach veterinariya xulosalari yoza boshlaydi va fermalarni tekshira oladi. Raqamni davlat reestri bilan solishtirganingizga ishonch hosil qiling.`,
              confirmText: "Ha, tasdiqlansin",
            }
          : {
              type: "danger" as const,
              title: "Tasdiq bekor qilinsinmi?",
              description: `${pendingAction.vet.user.fullName} endi hisobot yoza olmaydi va ferma tekshira olmaydi. Ilgari yozgan xulosalari joyida qoladi.`,
              confirmText: "Ha, bekor qilinsin",
            };
      case "changeRole":
        return {
          type: "warning" as const,
          title: "Rol o'zgartirilsinmi?",
          description: `${pendingAction.user.fullName} uchun rol «${USER_ROLE[pendingAction.user.role]}» dan «${USER_ROLE[pendingAction.role]}» ga o'zgaradi. Bu foydalanuvchining kirish huquqlarini darhol o'zgartiradi.`,
          confirmText: "Ha, o'zgartirilsin",
        };
    }
  }, [pendingAction]);

  // ---- Ko'rinish ----------------------------------------------------------
  const navItems: DashboardNavItem<TabKey>[] = [
    { key: "overview", label: "Umumiy ko'rinish", icon: LayoutDashboard },
    { key: "farms", label: "Fermalar", icon: Building2, badge: pendingFarms.length },
    { key: "investments", label: "Bitimlar navbati", icon: Coins, badge: queueTotal },
    {
      key: "vets",
      label: "Veterinarlar",
      icon: Stethoscope,
      // Faqat tasdiq kutayotganlar sanaladi — nishon "ish bor" degani
      // bo'lishi kerak, "shuncha vet bor" degani emas.
      badge: pendingVetCount,
    },
    { key: "users", label: "Foydalanuvchilar", icon: Users, badge: users.length },
  ];

  return (
    <PageTransition>
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Administrator kabineti
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            {currentUser?.fullName ?? "Boshqaruv markazi"}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Ferma tasdiqlari, escrow oqimi va foydalanuvchilar bir joyda.
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
                onClick={loadAdminData}
                className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950"
              >
                Qayta urinish
              </button>
            </div>
          </div>
        )}

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
                    icon={Wallet}
                    label="Kafolat hisobida"
                    value={
                      dashboard
                        ? formatUzsCompact(dashboard.finance.totalEscrowHeldUzs)
                        : "—"
                    }
                    hint="Hali fermerga o'tkazilmagan"
                    accent
                  />
                  <StatTile
                    icon={Coins}
                    label="Platforma komissiyasi"
                    value={
                      dashboard
                        ? formatUzsCompact(
                            dashboard.finance.totalPlatformFeeCollectedUzs,
                          )
                        : "—"
                    }
                    hint="Yakunlangan sotuvlardan"
                  />
                  <StatTile
                    icon={ShieldCheck}
                    label="Taqsimlangan to'lovlar"
                    value={
                      dashboard
                        ? formatUzsCompact(dashboard.finance.totalPayoutsCompletedUzs)
                        : "—"
                    }
                    hint="Investor va fermerlarga"
                  />
                  <StatTile
                    icon={ListChecks}
                    label="Kutilayotgan amallar"
                    value={String(queueTotal + pendingFarms.length)}
                    hint="Navbat sizda"
                  />
                </div>

                <Panel>
                  <PanelHeader
                    icon={AlertTriangle}
                    title="Sizning e'tiboringizni kutmoqda"
                    subtitle="Navbat administratorda bo'lgan ishlar"
                  />
                  {isLoading ? (
                    <SkeletonRows rows={3} />
                  ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {pendingFarms.length > 0 && (
                        <AttentionRow
                          title={`${pendingFarms.length} ta ferma tasdiq kutmoqda`}
                          description="Tasdiqlanmagan ferma bozorga qo'zi chiqara olmaydi."
                          actionLabel="Fermalarga o'tish"
                          onAction={() => setTab("farms")}
                        />
                      )}
                      {queues
                        .filter((item) => item.items.length > 0)
                        .map((item) => (
                          <AttentionRow
                            key={item.key}
                            title={`${item.items.length} ta bitim: ${item.label.toLowerCase()}`}
                            description={item.hint}
                            actionLabel="Navbatni ochish"
                            onAction={() => {
                              setQueue(item.key);
                              setTab("investments");
                            }}
                          />
                        ))}
                      {pendingKycCount > 0 && (
                        <AttentionRow
                          title={`${pendingKycCount} ta shaxs tasdig'i (KYC) ko'rib chiqilmagan`}
                          description="KYC arizalarini tasdiqlash hozircha interfeysda emas — backend orqali bajariladi."
                          actionLabel="Foydalanuvchilar"
                          onAction={() => setTab("users")}
                        />
                      )}
                      {pendingFarms.length === 0 &&
                        queueTotal === 0 &&
                        pendingKycCount === 0 && (
                          <p className="px-5 py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                            Hozircha sizdan talab qilinadigan amal yo'q.
                          </p>
                        )}
                    </div>
                  )}
                </Panel>
              </>
            )}

            {/* ---------------- Fermalar ---------------- */}
            {tab === "farms" && (
              <Panel className="overflow-hidden">
                <PanelHeader
                  icon={Building2}
                  title="Tasdiq kutayotgan fermalar"
                  subtitle="Veterinar xulosasidan keyingi yakuniy platforma tasdig'i"
                />
                {isLoading ? (
                  <SkeletonRows rows={4} />
                ) : pendingFarms.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Navbat bo'sh"
                    description="Hozir platforma tasdig'ini kutayotgan ferma yo'q."
                  />
                ) : (
                  <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                    {pendingFarms.map((farm) => {
                      const meta = FARM_VERIFICATION[farm.verificationStatus];
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
                              <StatusChip
                                label={meta.label}
                                colorVar={
                                  meta.tone === "progress" ? "--stage-1" : "--stage-off"
                                }
                                size="sm"
                              />
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                              {farm.region}
                              {farm.district ? `, ${farm.district}` : ""} · ★{" "}
                              <span className="tabular-nums">{farm.rating}</span>
                            </p>
                            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                              {meta.description}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({ kind: "verifyFarm", farm, approve: true })
                              }
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                              Tasdiqlash
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  kind: "verifyFarm",
                                  farm,
                                  approve: false,
                                })
                              }
                              className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-stone-700 dark:hover:bg-red-950/40"
                            >
                              Rad etish
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            )}

            {/* ---------------- Bitimlar navbati ---------------- */}
            {tab === "investments" && (
              <Panel className="overflow-hidden">
                <PanelHeader
                  icon={Coins}
                  title="Bitimlar navbati"
                  subtitle="Escrow, sotuv va foyda taqsimoti bosqichlari"
                />
                {isLoading ? (
                  <SkeletonRows rows={5} />
                ) : (
                  <InvestmentQueue
                    queues={queues}
                    active={queue}
                    onSelect={setQueue}
                    onAct={handleQueueAction}
                    isBusy={isSubmitting}
                  />
                )}
              </Panel>
            )}

            {/* ---------------- Foydalanuvchilar ---------------- */}
            {tab === "vets" && (
              <Panel className="overflow-hidden">
                <PanelHeader
                  icon={Stethoscope}
                  title="Veterinarlar"
                  subtitle="Tasdiqlanmagan veterinar hisobot yoza olmaydi va ferma tekshira olmaydi"
                />
                <div className="p-4">
                  {isLoading ? (
                    <SkeletonRows rows={4} />
                  ) : (
                    <VetsTable
                      vets={vets}
                      onRequestVerify={(vet, verify) =>
                        setPendingAction({ kind: "verifyVet", vet, verify })
                      }
                    />
                  )}
                </div>
              </Panel>
            )}

            {tab === "users" && (
              <Panel className="overflow-hidden">
                <PanelHeader
                  icon={Users}
                  title="Foydalanuvchilar"
                  subtitle="Rolni o'zgartirish darhol kuchga kiradi"
                />
                {isLoading ? (
                  <SkeletonRows rows={6} />
                ) : (
                  <UsersTable
                    users={users}
                    onRequestRoleChange={(user, role) =>
                      setPendingAction({ kind: "changeRole", user, role })
                    }
                  />
                )}
              </Panel>
            )}
          </div>
        </div>
      </main>

      <SaleAmountModal
        investment={saleTarget}
        isSubmitting={isSubmitting}
        onClose={() => setSaleTarget(null)}
        onSubmit={(saleAmountUzs) =>
          saleTarget &&
          runAction(
            () =>
              getApiClient().investments.completeSale(saleTarget.id, { saleAmountUzs }),
            "Sotuv yakunlandi va foyda hisoblandi.",
            "Sotuvni yakunlashda xatolik",
          )
        }
      />

      {pendingAction && confirmCopy && (
        <ConfirmModal
          isOpen
          type={confirmCopy.type}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmText={confirmCopy.confirmText}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
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
