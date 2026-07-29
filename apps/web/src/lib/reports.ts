import type { MonthlyReport } from "@livestock-invest/shared-types";

/**
 * Oylik hisobotlardan har bir oy uchun bittasini qoldiradi — eng oxirgi
 * yuborilganini.
 *
 * Backend bir oyga bir nechta hisobot yuborishga to'sqinlik qilmaydi (fermer
 * avvalgi o'lchovni tuzatishi mumkin). Oy bo'yicha ko'rsatiladigan joylarda —
 * vazn grafigi va "Oy / Vazn / O'zgarish" jadvali — takroriy yozuv ikki xil
 * zarar keltiradi: grafikda bir oyda ikki nuqta paydo bo'ladi, jadvalda esa
 * tuzatish oylik o'sish bo'lib ko'rinadi.
 *
 * Hisobotlarning to'liq ro'yxati (tuzatish tarixi bilan) ko'rsatiladigan
 * joylarda bu funksiya ishlatilmaydi.
 */
export function latestReportPerMonth(reports: MonthlyReport[]): MonthlyReport[] {
  const byMonth = new Map<string, MonthlyReport>();
  for (const report of reports) {
    const existing = byMonth.get(report.month);
    if (!existing || report.createdAt > existing.createdAt) {
      byMonth.set(report.month, report);
    }
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}
