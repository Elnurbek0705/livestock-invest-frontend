import Link from "next/link";
import { notFound } from "next/navigation";
import { getApiClient } from "@livestock-invest/api-client";
import type { Farm, MonthlyReport, VetReport } from "@livestock-invest/shared-types";
import {
  ArrowLeft,
  Building2,
  FileText,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { InvestButton } from "./InvestButton";
import { PageTransition } from "@/components/PageTransition";
import { PhotoGallery } from "@/components/marketplace/PhotoGallery";
import {
  EmptyState,
  Panel,
  PanelHeader,
  StatusChip,
} from "@/components/dashboard/primitives";
import { latestReportPerMonth } from "@/lib/reports";
import {
  FARM_VERIFICATION,
  LIVESTOCK_STATUS,
  formatDateUz,
  formatMonthUz,
  formatUzs,
  shortId,
} from "@/lib/uz";

/**
 * Qo'zi sahifasi.
 *
 * Ilgari bu sahifadagi ma'lumotning katta qismi kodda qattiq yozilgan edi:
 * "Toshkent viloyati, Parkent", "Hamkor Ferma: Toshkent Model Ferma №12",
 * "Reyting: 4.9", "Vaktsinalar to'liq" va narxni 1.32 ga ko'paytirib
 * hisoblangan "kutilayotgan sotuv qiymati". Endi sahifada faqat backend
 * bergan ma'lumot ko'rsatiladi: ferma yozuvi, oylik vazn hisobotlari va
 * veterinar xulosalari. Ma'lumot yo'q bo'lsa, o'ylab topilmaydi — bo'sh
 * holat ko'rsatiladi.
 */
export default async function LivestockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = getApiClient();

  const livestock = await api.livestock.getById(id);
  if (!livestock) {
    notFound();
  }

  // Yordamchi ma'lumotlar sahifani yiqitmasligi kerak: biri kelmasa ham
  // asosiy e'lon ko'rinaveradi.
  const [farm, monthlyReports, vetReports] = await Promise.all([
    api.farms.getById(livestock.farmId).catch((): Farm | null => null),
    api.livestock.getMonthlyReports(id).catch((): MonthlyReport[] => []),
    api.livestock.getVetReports(id).catch((): VetReport[] => []),
  ]);

  const title = livestock.breed ?? "Zoti ko'rsatilmagan qo'zi";
  const status = LIVESTOCK_STATUS[livestock.status];
  const location = [farm?.region, farm?.district].filter(Boolean).join(", ");

  // Oylar o'sish tartibida — "o'zgarish" ustuni oldingi oyga nisbatan. Bir oyga
  // bir nechta hisobot bo'lsa eng oxirgisi olinadi, aks holda tuzatish oylik
  // o'sish bo'lib ko'rinadi.
  const weightHistory = latestReportPerMonth(monthlyReports);

  const specs = [
    { label: "Joriy vazn", value: `${livestock.currentWeightKg} kg` },
    {
      label: "Yoshi",
      value: livestock.ageMonths != null ? `${livestock.ageMonths} oylik` : "—",
    },
    { label: "Investor ulushi", value: `${livestock.offeredInvestorSharePercent}%` },
    { label: "Kutilayotgan sotuv", value: formatDateUz(livestock.expectedSaleDate) },
  ];

  return (
    <PageTransition>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-emerald-600 dark:text-stone-400"
        >
          <ArrowLeft className="h-4 w-4" /> Bozorga qaytish
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {[farm?.name, location].filter(Boolean).join(" · ") || "Ferma ko'rsatilmagan"}
              <span className="ml-2 tabular-nums text-stone-400">
                #{shortId(livestock.id)}
              </span>
            </p>
          </div>
          <StatusChip label={status.label} colorVar={status.colorVar} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Chap ustun */}
          <div className="space-y-5 lg:col-span-2">
            <PhotoGallery photoUrls={livestock.photoUrls} alt={title} />

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-white px-4 py-3 dark:bg-zinc-900">
                  <dt className="text-xs text-stone-500 dark:text-stone-400">
                    {spec.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900 dark:text-white">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Vazn tarixi */}
            <Panel className="overflow-hidden">
              <PanelHeader
                icon={FileText}
                title="Vazn tarixi"
                subtitle="Fermer yuborgan oylik hisobotlar"
              />
              {weightHistory.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Hali hisobot yo'q"
                  description="Parvarish boshlangach, har oygi vazn o'lchovi shu yerda ko'rinadi."
                />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                      <th scope="col" className="px-4 py-2.5 font-medium">Oy</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-medium">Vazn</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-medium">
                        O'zgarish
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Izoh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightHistory.map((report, index) => {
                      const previous = weightHistory[index - 1];
                      const delta = previous ? report.weightKg - previous.weightKg : null;
                      return (
                        <tr
                          key={report.id}
                          className="border-b border-stone-100 last:border-0 dark:border-stone-800/70"
                        >
                          <td className="px-4 py-2.5 text-stone-700 dark:text-stone-200">
                            {formatMonthUz(report.month)}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium text-stone-900 dark:text-white">
                            {report.weightKg} kg
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-stone-500 dark:text-stone-400">
                            {delta == null
                              ? "—"
                              : `${delta > 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",").replace(",0", "")} kg`}
                          </td>
                          <td className="max-w-xs truncate px-4 py-2.5 text-stone-500 dark:text-stone-400">
                            {report.notes}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Panel>

            {/* Veterinar xulosalari */}
            <Panel className="overflow-hidden">
              <PanelHeader
                icon={Stethoscope}
                title="Veterinar xulosalari"
                subtitle="Mustaqil veterinar ko'riklari"
              />
              {vetReports.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="Xulosa qo'shilmagan"
                  description="Veterinar ko'rigi o'tkazilgach, xulosa shu yerda ochiq ko'rinadi."
                />
              ) : (
                <ul className="divide-y divide-stone-100 dark:divide-stone-800/70">
                  {vetReports.map((report) => (
                    <li key={report.id} className="px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {formatDateUz(report.createdAt)}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-white">
                          {report.weightKg} kg
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                        {report.healthNotes}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Ferma */}
            <Panel className="overflow-hidden">
              <PanelHeader icon={Building2} title="Ferma" />
              {farm ? (
                <dl className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-400">Nomi</dt>
                    <dd className="mt-0.5 font-medium text-stone-900 dark:text-white">
                      {farm.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-400">Hudud</dt>
                    <dd className="mt-0.5 font-medium text-stone-900 dark:text-white">
                      {location || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-400">Holati</dt>
                    <dd className="mt-0.5 font-medium text-stone-900 dark:text-white">
                      {FARM_VERIFICATION[farm.verificationStatus].label}
                    </dd>
                  </div>
                </dl>
              ) : (
                <EmptyState
                  icon={Building2}
                  title="Ferma ma'lumoti yo'q"
                  description="Bu e'lon uchun ferma yozuvi topilmadi."
                />
              )}
            </Panel>
          </div>

          {/* O'ng ustun — sarmoya paneli */}
          <div className="lg:col-span-1">
            <Panel className="lg:sticky lg:top-24">
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Sarmoya summasi
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-stone-900 dark:text-white">
                    {formatUzs(livestock.priceUzs)}
                  </p>
                </div>

                <dl className="space-y-2 border-y border-stone-100 py-3 text-sm dark:border-stone-800">
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500 dark:text-stone-400">Investor ulushi</dt>
                    <dd className="font-semibold tabular-nums text-stone-900 dark:text-white">
                      {livestock.offeredInvestorSharePercent}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500 dark:text-stone-400">Kutilayotgan sotuv</dt>
                    <dd className="font-medium tabular-nums text-stone-900 dark:text-white">
                      {formatDateUz(livestock.expectedSaleDate)}
                    </dd>
                  </div>
                </dl>

                {livestock.status === "listed" ? (
                  <InvestButton livestockId={livestock.id} />
                ) : (
                  <p className="rounded-xl bg-stone-100 p-3 text-center text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    Bu qo'zi hozir sarmoya qabul qilmaydi — holati: {status.label}.
                  </p>
                )}

                <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Pul kafolat (escrow) hisobida saqlanadi va fermerga faqat parvarish
                  boshlangach o'tkaziladi. Ulush — foyda taqsimoti bo'yicha shartnoma
                  ulushi, kafolatlangan daromad emas.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
