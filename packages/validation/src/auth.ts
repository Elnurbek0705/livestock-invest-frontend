import { z } from "zod";

// O'zbekiston telefon raqami: +998 XX XXX XX XX
const uzPhoneRegex = /^\+998\d{9}$/;

export const registerSchema = z.object({
  fullName: z.string().min(3, "To'liq ism kamida 3 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().regex(uzPhoneRegex, "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak"),
  email: z.string().email("Email noto'g'ri formatda").optional(),
  role: z.enum(["investor", "farmer"], {
    errorMap: () => ({ message: "Rolni tanlang: investor yoki fermer" }),
  }),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phone: z.string().regex(uzPhoneRegex, "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak"),
  password: z.string().min(1, "Parolni kiriting"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const kycSubmissionSchema = z.object({
  passportSeries: z.string().regex(/^[A-Z]{2}\d{7}$/, "Passport seriyasi noto'g'ri (masalan: AB1234567)"),
  passportPhotoUrl: z.string().url("Passport rasmi yuklanmagan"),
  selfieUrl: z.string().url("Selfie rasmi yuklanmagan"),
});

export type KycSubmissionInput = z.infer<typeof kycSubmissionSchema>;
