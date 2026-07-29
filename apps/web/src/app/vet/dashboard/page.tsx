"use client";

import { useEffect, useState } from "react";
import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import { PageTransition } from "@/components/PageTransition";
import {
  Stethoscope,
  Building2,
  CheckCircle2,
  XCircle,
  FilePlus,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast/ToastProvider";
import { FARM_VERIFICATION } from "@/lib/uz";
import { useScrollLock } from "@/lib/useScrollLock";

export default function VetDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  const [pendingFarms, setPendingFarms] = useState<Farm[]>([]);
  const [activeLivestock, setActiveLivestock] = useState<Livestock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vet report modal
  const [selectedLivestockId, setSelectedLivestockId] = useState<string | null>(null);

  // Modal ochiq turganda orqadagi sahifa scroll bo'lmasin
  useScrollLock(selectedLivestockId !== null);
  const [reportForm, setReportForm] = useState({
    weightKg: 40,
    healthNotes: "Vaktsinatsiyadan o'tdi, parazitlarga qarshi dori berildi, ishtahasi va holati yaxshi.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVetData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const [farms, livestock] = await Promise.all([
        api.farms.list(),
        api.livestock.list(),
      ]);
      setPendingFarms(farms.filter((f) => f.verificationStatus === "pending" || f.verificationStatus === "vet_approved"));
      setActiveLivestock(livestock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "vet" && user.role !== "admin") {
      router.push("/");
      return;
    }
    loadVetData();
  }, [user]);

  const handleVerifyFarm = async (farmId: string, status: "vet_approved" | "rejected") => {
    try {
      const api = getApiClient();
      await api.farms.verify(farmId, status);
      await loadVetData();
      if (status === "vet_approved") {
        toast.success("Ferma veterinariya ko'rigidan o'tib tasdiqlandi!", "Ferma Tasdiqlandi");
      } else {
        toast.warning("Ferma verifikatsiyasi rad etildi", "Ferma Rad Etildi");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ferma statusini o'zgartirishda xatolik", "Xatolik");
    }
  };

  const handleAddVetReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLivestockId) return;
    setIsSubmitting(true);
    try {
      const api = getApiClient();
      await api.livestock.addVetReport(selectedLivestockId, reportForm);
      setSelectedLivestockId(null);
      toast.success("Veterinariya tibbiy xulosasi saqlandi!", "Xulosa Yuklandi");
      await loadVetData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Vet hisobotini saqlashda xatolik", "Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950 p-8 sm:p-10 text-white shadow-xl border border-emerald-500/20">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <Stethoscope className="h-3.5 w-3.5" /> Veterinariya Boshqaruvi
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Veterinar Nazorati va Tibbiy Pasportlar
            </h1>
            <p className="text-zinc-400 text-sm">
              Fermalarni sanitariya va sanitariya standartlari bo'yicha ko'rib chiqing va chorva salomatligi bo'yicha tibbiy xulosalarni yuklang.
            </p>
          </div>
        </div>

        {isLoading && <p className="text-center text-zinc-500 py-8">Yuklanmoqda...</p>}
        {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</div>}

        {/* Section 1: Pending Farm Verifications */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Veterinar Tasdig'ini Kutayotgan Fermalar ({pendingFarms.length})
          </h2>

          {pendingFarms.length === 0 ? (
            <p className="text-sm text-zinc-500 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              Tekshirilishi kerak bo'lgan fermalar mavjud emas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
                >
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{farm.name}</h3>
                    <p className="text-xs text-zinc-500">
                      Hudud: {farm.region} {farm.district ? `, ${farm.district}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 font-semibold">Holati:</span>
                    <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      {FARM_VERIFICATION[farm.verificationStatus].label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleVerifyFarm(farm.id, "vet_approved")}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleVerifyFarm(farm.id, "rejected")}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Rad etish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Livestock Health Reports */}
        <section className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            Chorvalarga Tibbiy Xulosa Yuklash ({activeLivestock.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeLivestock.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    {item.breed ?? "Zotdor Qo'zi"}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {item.currentWeightKg} kg
                  </span>
                </div>

                <p className="text-xs text-zinc-500">Sotuv sanasi: {item.expectedSaleDate}</p>

                <button
                  onClick={() => setSelectedLivestockId(item.id)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                >
                  <FilePlus className="h-4 w-4" /> Vet Xulosasi Qo'shish
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Modal: Vet Report */}
        {selectedLivestockId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Veterinariya Tibbiy Hisoboti</h3>
                <button onClick={() => setSelectedLivestockId(null)}><X className="h-5 w-5 text-zinc-400" /></button>
              </div>

              <form onSubmit={handleAddVetReport} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-bold mb-1">Tekshiruvdagi Vazn (kg)</label>
                  <input
                    type="number"
                    required
                    value={reportForm.weightKg}
                    onChange={(e) => setReportForm({ ...reportForm, weightKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Salomatlik Izohlari va Vaktsinalar</label>
                  <textarea
                    rows={4}
                    required
                    value={reportForm.healthNotes}
                    onChange={(e) => setReportForm({ ...reportForm, healthNotes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Xulosani Saqlash"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
