import { z } from "zod";

export const createLivestockSchema = z.object({
  farmId: z.string().uuid(),
  breed: z.string().optional(),
  currentWeightKg: z.number().positive("Vazn musbat son bo'lishi kerak"),
  ageMonths: z.number().int().min(0).max(60).optional(),
  priceUzs: z.number().min(500_000, "Minimal narx 500 000 so'm"),
  offeredInvestorSharePercent: z.number().min(0).max(100).optional(),
  expectedSaleDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Sana noto'g'ri formatda",
  }),
  photoUrls: z.array(z.string().url()).optional(),
});

export type CreateLivestockInput = z.infer<typeof createLivestockSchema>;

// Diqqat: investor foizni o'zi kiritmaydi — u Livestock.offeredInvestorSharePercent'dan
// avtomatik olinadi. Shuning uchun bu forma faqat livestockId'ni yuboradi.
export const createInvestmentSchema = z.object({
  livestockId: z.string().uuid(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;

// Bu forma qiymatlari uchun; livestockId so'rov URL'idan (route param) olinadi,
// body'ga qo'shilmaydi.
export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Oy formati: YYYY-MM"),
  weightKg: z.number().positive(),
  notes: z.string().min(5, "Izoh juda qisqa"),
  photoUrls: z.array(z.string().url()).default([]),
});

export type MonthlyReportInput = z.infer<typeof monthlyReportSchema>;

export const verifyFarmSchema = z.object({
  status: z.enum(["pending", "vet_approved", "platform_approved", "rejected"]),
});

export type VerifyFarmInput = z.infer<typeof verifyFarmSchema>;

export const completeSaleSchema = z.object({
  saleAmountUzs: z.number().positive(),
  platformFeePercent: z.number().min(0).max(100).optional(),
});

export type CompleteSaleInput = z.infer<typeof completeSaleSchema>;
