"use client";

import { useEffect, useState } from "react";
import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { PageTransition } from "@/components/PageTransition";
import { Building2, Plus, Sprout, FilePlus, X, Loader as Loader2 } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/Toast/ToastProvider";

export default function FarmerDashboardPage() {
  const { state } = useRequireAuth("farmer");
  const toast = useToast();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [livestockList, setLivestockList] = useState<Livestock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddLivestockModal, setShowAddLivestockModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState<string | null>(null); // livestockId

  // Form states
  const [farmForm, setFarmForm] = useState({ name: "", region: "Toshkent", district: "" });
  const [livestockForm, setLivestockForm] = useState({
    farmId: "",
    breed: "Hisor",
    currentWeightKg: 35,
    ageMonths: 4,
    priceUzs: 3500000,
    offeredInvestorSharePercent: 70,
    expectedSaleDate: "2026-12-01",
  });
  const [reportForm, setReportForm] = useState({
    month: "2026-08",
    weightKg: 40,
    notes: "Chorva emlashdan o'tdi, ishtahasi a'lo darajada.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFarmerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const [myFarms, myLivestock] = await Promise.all([
        api.farms.mine(),
        api.livestock.mine(),
      ]);
      setFarms(myFarms);
      setLivestockList(myLivestock);
      if (myFarms.length > 0) {
        setLivestockForm((prev) => ({ ...prev, farmId: myFarms[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state !== "authenticated") return;
    loadFarmerData();
  }, [state]);

  // Actions
  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      await api.farms.create(farmForm);
      setShowAddFarmModal(false);
      setFarmForm({ name: "", region: "Toshkent", district: "" });
      toast.success("Ferma muvaffaqiyatli saqlandi!", "Yangi Ferma Yaratildi");
      await loadFarmerData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ferma yaratishda xatolik", "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livestockForm.farmId) {
      toast.warning("Iltimos, avval tasdiqlangan ferma tanlang!", "Ferma Tanlanmagan");
      return;
    }
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      await api.livestock.create(livestockForm);
      setShowAddLivestockModal(false);
      toast.success("Yangi qo'zi e'loni Marketplace'ga muvaffaqiyatli qo'shildi!", "Chorva Qo'shildi");
      await loadFarmerData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chorva qo'shishda xatolik", "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddReportModal) return;
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      await api.livestock.addMonthlyReport(showAddReportModal, reportForm);
      setShowAddReportModal(null);
      toast.success("Oylik vazn va parvarish hisoboti saqlandi!", "Hisobot Yuborildi");
      await loadFarmerData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hisobot qo'shishda xatolik", "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (livestockId: string, status: any) => {
    try {
      const api = getApiClient();
      await api.livestock.updateStatus(livestockId, status);
      toast.info(`Chorva statusi '${status}' ga o'zgartirildi`, "Status Yangilandi");
      await loadFarmerData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Statusni yangilashda xatolik", "Xatolik");
    }
  };

  if (state !== "authenticated") {
    return (
      <PageTransition>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm font-semibold">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" /> Yuklanmoqda...
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-emerald-500/20">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <Building2 className="h-3.5 w-3.5" /> Fermer Kabineti
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                Fermalar va Chorva Boshqaruvi
              </h1>
              <p className="text-zinc-400 text-sm">
                Fermangizni ro'yxatdan o'tkazing, investitsiya uchun qo'zilar qo'shing va oylik hisobotlarni yangilang.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddFarmModal(true)}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-emerald-50 transition-all shadow-md"
              >
                <Plus className="h-4 w-4 text-emerald-600" /> Ferma Qo'shish
              </button>
              <button
                onClick={() => setShowAddLivestockModal(true)}
                disabled={farms.length === 0}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md disabled:opacity-50"
              >
                <Sprout className="h-4 w-4" /> Qo'zi Qo'shish
              </button>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {isLoading && <p className="text-center text-zinc-500 py-8">Yuklanmoqda...</p>}
        {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</div>}

        {/* Section 1: Farms List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Mening Fermalarim ({farms.length})
            </h2>
          </div>

          {farms.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
              <Building2 className="h-10 w-10 text-zinc-400 mx-auto" />
              <p className="text-sm text-zinc-500">Hozircha fermangiz yo'q. Birinchi fermangizni qo'shing.</p>
              <button
                onClick={() => setShowAddFarmModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                <Plus className="h-4 w-4" /> Yangi Ferma Qo'shish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{farm.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      ★ {farm.rating}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    Hudud: {farm.region} {farm.district ? `, ${farm.district}` : ""}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">Verifikatsiya:</span>
                    <span className="text-xs font-extrabold capitalize text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {farm.verificationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Livestock List */}
        <section className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-600" />
              Mening Qo'zilarim ({livestockList.length})
            </h2>
          </div>

          {livestockList.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
              <Sprout className="h-10 w-10 text-zinc-400 mx-auto" />
              <p className="text-sm text-zinc-500">Marketplace'ga chiqarilgan qo'zilar mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestockList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                      {item.breed ?? "Zotdor Qo'zi"}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span>Joriy Vazn:</span> <span className="font-bold text-zinc-900 dark:text-white">{item.currentWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investitsiya Narxi:</span> <span className="font-bold text-zinc-900 dark:text-white">{item.priceUzs.toLocaleString("uz-UZ")} so'm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investor Ulushi:</span> <span className="font-bold text-emerald-600">{item.offeredInvestorSharePercent}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-400">Holatni o'zgartirish:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="py-1 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold bg-white dark:bg-zinc-800"
                      >
                        <option value="listed">listed</option>
                        <option value="funded">funded</option>
                        <option value="in_care">in_care</option>
                        <option value="ready_for_sale">ready_for_sale</option>
                        <option value="sold">sold</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAddReportModal(item.id)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all"
                    >
                      <FilePlus className="h-3.5 w-3.5 text-emerald-600" /> Oylik Hisobot Qo'shish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal 1: Add Farm */}
        {showAddFarmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Yangi Ferma Yaratish</h3>
                <button onClick={() => setShowAddFarmModal(false)}><X className="h-5 w-5 text-zinc-400" /></button>
              </div>

              <form onSubmit={handleCreateFarm} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-bold mb-1">Ferma Nomi</label>
                  <input
                    type="text"
                    required
                    value={farmForm.name}
                    onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                    placeholder="Masalan: Yusupov Chorva Xo'jaligi"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Viloyat / Region</label>
                  <input
                    type="text"
                    required
                    value={farmForm.region}
                    onChange={(e) => setFarmForm({ ...farmForm, region: e.target.value })}
                    placeholder="Toshkent, Samarkand, etc."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Tuman (Tuman/District)</label>
                  <input
                    type="text"
                    value={farmForm.district}
                    onChange={(e) => setFarmForm({ ...farmForm, district: e.target.value })}
                    placeholder="Parkent, Urganch, etc."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Fermani Saqlash"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Add Livestock */}
        {showAddLivestockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Yangi Qo'zi / Chorva E'loni</h3>
                <button onClick={() => setShowAddLivestockModal(false)}><X className="h-5 w-5 text-zinc-400" /></button>
              </div>

              <form onSubmit={handleCreateLivestock} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-bold mb-1">Tegishli Ferma</label>
                  <select
                    value={livestockForm.farmId}
                    onChange={(e) => setLivestockForm({ ...livestockForm, farmId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.region})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Chorva Zoti (Breed)</label>
                  <input
                    type="text"
                    required
                    value={livestockForm.breed}
                    onChange={(e) => setLivestockForm({ ...livestockForm, breed: e.target.value })}
                    placeholder="Hisor, Qorako'l, etc."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Vazni (kg)</label>
                    <input
                      type="number"
                      required
                      value={livestockForm.currentWeightKg}
                      onChange={(e) => setLivestockForm({ ...livestockForm, currentWeightKg: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Yoshi (oy)</label>
                    <input
                      type="number"
                      value={livestockForm.ageMonths}
                      onChange={(e) => setLivestockForm({ ...livestockForm, ageMonths: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Boshlang'ich Narxi (UZS)</label>
                  <input
                    type="number"
                    required
                    value={livestockForm.priceUzs}
                    onChange={(e) => setLivestockForm({ ...livestockForm, priceUzs: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Sotuv Sanasi</label>
                  <input
                    type="date"
                    required
                    value={livestockForm.expectedSaleDate}
                    onChange={(e) => setLivestockForm({ ...livestockForm, expectedSaleDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Joylashtirilmoqda..." : "E'lonni Marketplace'ga Chiqarish"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Add Monthly Report */}
        {showAddReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Oylik Vazn Hisoboti</h3>
                <button onClick={() => setShowAddReportModal(null)}><X className="h-5 w-5 text-zinc-400" /></button>
              </div>

              <form onSubmit={handleAddReport} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-bold mb-1">Hisobot Oyi (YYYY-MM)</label>
                  <input
                    type="text"
                    required
                    value={reportForm.month}
                    onChange={(e) => setReportForm({ ...reportForm, month: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">O'lchangan Vazn (kg)</label>
                  <input
                    type="number"
                    required
                    value={reportForm.weightKg}
                    onChange={(e) => setReportForm({ ...reportForm, weightKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Izohlar va Parvarish Holati</label>
                  <textarea
                    rows={3}
                    value={reportForm.notes}
                    onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Hisobotni Saqlash"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
