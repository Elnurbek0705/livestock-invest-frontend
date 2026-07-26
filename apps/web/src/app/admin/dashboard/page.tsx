"use client";

import { useEffect, useState } from "react";
import { getApiClient } from "@livestock-invest/api-client";
import type { AdminDashboard, User, Farm, Investment } from "@livestock-invest/shared-types";
import { PageTransition } from "@/components/PageTransition";
import {
  ShieldAlert,
  Coins,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<"all" | "farmer" | "investor" | "admin" | "vet">("all");

  // Complete Sale modal state
  const [saleModalInvestmentId, setSaleModalInvestmentId] = useState<string | null>(null);
  const [saleAmountUzs, setSaleAmountUzs] = useState<number>(5000000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const [dashData, userList] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.listUsers(),
      ]);
      setDashboard(dashData);
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin ma'lumotlarini yuklab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/");
      return;
    }
    loadAdminData();
  }, [currentUser]);

  // Actions
  const handleVerifyFarm = async (farmId: string, status: "platform_approved" | "rejected") => {
    try {
      const api = getApiClient();
      await api.farms.verify(farmId, status);
      await loadAdminData();
      alert(`Ferma ${status === "platform_approved" ? "tasdiqlandi" : "rad etildi"}!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  };

  const handleReleaseEscrow = async (investmentId: string) => {
    if (!confirm("Escrow pulini fermerga o'tkazishni tasdiqlaysizmi?")) return;
    try {
      const api = getApiClient();
      await api.investments.releaseToFarmer(investmentId);
      await loadAdminData();
      alert("Escrow puli fermerga o'tkazildi!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Escrow chiqarishda xatolik");
    }
  };

  const handleCompleteSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleModalInvestmentId) return;
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      await api.investments.completeSale(saleModalInvestmentId, { saleAmountUzs });
      setSaleModalInvestmentId(null);
      await loadAdminData();
      alert("Sotuv yakunlandi va foyda hisoblandi!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sotuvni yakunlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePayout = async (investmentId: string) => {
    if (!confirm("Investor va fermerga foyda taqsimotini tasdiqlaysizmi?")) return;
    try {
      const api = getApiClient();
      await api.investments.completePayout(investmentId);
      await loadAdminData();
      alert("Foyda taqsimoti yakunlandi!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payout bajarishda xatolik");
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const api = getApiClient();
      await api.admin.updateUserRole(userId, role);
      await loadAdminData();
      alert("Foydalanuvchi roli yangilandi!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Rolni o'zgartirishda xatolik");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (activeRoleTab === "all") return true;
    return user.role === activeRoleTab;
  });

  const roleTabs = [
    { key: "all", label: "Barchasi", count: users.length },
    { key: "farmer", label: "Farmerlar", count: users.filter((user) => user.role === "farmer").length },
    { key: "investor", label: "Investorlar", count: users.filter((user) => user.role === "investor").length },
    { key: "admin", label: "Adminlar", count: users.filter((user) => user.role === "admin").length },
    { key: "vet", label: "VET", count: users.filter((user) => user.role === "vet").length },
  ] as const;

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-900 via-zinc-900 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-emerald-500/20">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <ShieldAlert className="h-3.5 w-3.5" /> Platforma Boshqaruv Markazi
            </div>
            <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm">
              Moliya oqimlari, Escrow chiqarish, sotuv va payout bosqichlari va foydalanuvchilar boshqaruvi.
            </p>
          </div>
        </div>

        {isLoading && <p className="text-center text-zinc-500 py-8">Yuklanmoqda...</p>}
        {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</div>}

        {dashboard && (
          <>
            {/* Finance Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  Muzlatilgan Escrow Summasi
                </span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {dashboard.finance.totalEscrowHeldUzs.toLocaleString("uz-UZ")} so'm
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Platforma Komissiyasi (Fee)
                </span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {dashboard.finance.totalPlatformFeeCollectedUzs.toLocaleString("uz-UZ")} so'm
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Taqsimlangan Payoutlar
                </span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {dashboard.finance.totalPayoutsCompletedUzs.toLocaleString("uz-UZ")} so'm
                </div>
              </div>
            </div>

            {/* Pending Farms Approval Section */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Platforma Tasdig'ini Kutayotgan Fermalar ({dashboard.farms.pendingCount})
              </h2>

              {dashboard.farms.pending.length === 0 ? (
                <p className="text-xs text-zinc-500 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  Tasdiqlanishi kutilayotgan fermalar yo'q.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.farms.pending.map((farm) => (
                    <div
                      key={farm.id}
                      className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">{farm.name}</h4>
                        <p className="text-xs text-zinc-500">
                          {farm.region} | Status: {farm.verificationStatus}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyFarm(farm.id, "platform_approved")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleVerifyFarm(farm.id, "rejected")}
                          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50"
                        >
                          Rad Etish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Escrow & Payout Action Queue */}
            <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-600" />
                Investitsiya va Escrow Boshqaruvi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Awaiting Escrow Release */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    1. Fermerga Escrow Chiqarish ({dashboard.investments.awaitingEscrowReleaseCount})
                  </h3>
                  {dashboard.investments.awaitingEscrowRelease.map((inv) => (
                    <div key={inv.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Bitim ID: {inv.id.slice(0, 6)}</span>
                        <span>{inv.amountUzs.toLocaleString("uz-UZ")} so'm</span>
                      </div>
                      <button
                        onClick={() => handleReleaseEscrow(inv.id)}
                        className="w-full py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                      >
                        Fermerga Chiqarish
                      </button>
                    </div>
                  ))}
                </div>

                {/* 2. Awaiting Sale Completion */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    2. Sotuvni Yakunlash ({dashboard.investments.awaitingSaleCompletionCount})
                  </h3>
                  {dashboard.investments.awaitingSaleCompletion.map((inv) => (
                    <div key={inv.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Bitim ID: {inv.id.slice(0, 6)}</span>
                        <span>{inv.amountUzs.toLocaleString("uz-UZ")} so'm</span>
                      </div>
                      <button
                        onClick={() => setSaleModalInvestmentId(inv.id)}
                        className="w-full py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                      >
                        Sotuvni Kiritish
                      </button>
                    </div>
                  ))}
                </div>

                {/* 3. Awaiting Payout */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    3. Foydani Taqsimlash (Payout) ({dashboard.investments.awaitingPayoutCount})
                  </h3>
                  {dashboard.investments.awaitingPayout.map((inv) => (
                    <div key={inv.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Bitim ID: {inv.id.slice(0, 6)}</span>
                        <span>Foyda: {inv.investorShareUzs?.toLocaleString("uz-UZ")} so'm</span>
                      </div>
                      <button
                        onClick={() => handleCompletePayout(inv.id)}
                        className="w-full py-1.5 bg-purple-600 text-white rounded-lg font-bold"
                      >
                        Payout Bajarish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* User Roles Management */}
            <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Foydalanuvchilar Rollarini Boshqarish ({users.length})
              </h2>

              <div className="flex flex-wrap gap-2">
                {roleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveRoleTab(tab.key)}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                      activeRoleTab === tab.key
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase dark:bg-zinc-800/50">
                    <tr>
                      <th className="p-3">Ism Familiya</th>
                      <th className="p-3">Telefon</th>
                      <th className="p-3">Roli</th>
                      <th className="p-3">KYC Status</th>
                      <th className="p-3">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{u.fullName}</td>
                        <td className="p-3 text-zinc-500">{u.phone}</td>
                        <td className="p-3">
                          <span className="capitalize font-bold text-emerald-600">{u.role}</span>
                        </td>
                        <td className="p-3 capitalize text-zinc-400">{u.kycStatus}</td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="rounded-lg border border-zinc-300 p-1 text-xs font-bold dark:border-zinc-700"
                          >
                            <option value="investor">investor</option>
                            <option value="farmer">farmer</option>
                            <option value="vet">vet</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Modal: Complete Sale Amount */}
        {saleModalInvestmentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-sm">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sotuv Summasini Kiriting</h3>
              <form onSubmit={handleCompleteSaleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Bozor Sotuv Summasi (UZS)</label>
                  <input
                    type="number"
                    required
                    value={saleAmountUzs}
                    onChange={(e) => setSaleAmountUzs(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSaleModalInvestmentId(null)}
                    className="w-full py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold"
                  >
                    Bekor Qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
