import { z } from "zod";

export const createFarmSchema = z.object({
  name: z.string().min(2, "Ferma nomi kamida 2 ta belgidan iborat bo'lishi kerak").max(255),
  region: z.string().min(2, "Hududni kiriting (masalan: Xorazm)"),
  district: z.string().optional(),
});

export type CreateFarmInput = z.infer<typeof createFarmSchema>;

export const updateFarmSchema = createFarmSchema.partial();

export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
