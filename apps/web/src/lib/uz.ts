/**
 * Interfeysdagi barcha atamalar va formatlashning yagona manbasi.
 *
 * Backend inglizcha kalitlar qaytaradi ("listed", "platform_approved", ...) —
 * ular foydalanuvchiga hech qachon shu ko'rinishda ko'rsatilmaydi. Sahifalar
 * har doim shu fayldagi o'zbekcha yorliqlar orqali ishlaydi.
 */

import type {
  EscrowStatus,
  FarmVerificationStatus,
  KycStatus,
  LivestockStatus,
  Transaction,
  UserRole,
} from "@livestock-invest/shared-types";

// ============================================================
// Raqam va sana formatlari
// ============================================================

/** 3500000 → "3 500 000" (uzilmas probel bilan — raqam satr oxirida bo'linmaydi) */
function groupDigits(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** 3500000 → "3 500 000 so'm" */
export function formatUzs(value: number): string {
  return `${groupDigits(value)} so'm`;
}

function trimmed(value: number): string {
  return value
    .toFixed(value < 10 ? 1 : 0)
    .replace(".", ",")
    .replace(/,0$/, "");
}

/** Statistika kartochkalari uchun qisqa shakl: 3500000 → "3,5 mln so'm" */
export function formatUzsCompact(value: number): string {
  if (value >= 1_000_000_000) return `${trimmed(value / 1_000_000_000)} mlrd so'm`;
  if (value >= 1_000_000) return `${trimmed(value / 1_000_000)} mln so'm`;
  if (value >= 1_000) return `${trimmed(value / 1_000)} ming so'm`;
  return formatUzs(value);
}

const MONTHS_UZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

/**
 * "2026-12-01" yoki ISO sana → "1-dekabr, 2026-yil".
 *
 * Sana atayin `new Date` orqali emas, matn sifatida ajratiladi: server bergan
 * kalendar sana vaqt mintaqasiga qarab bir kun surilib ketmasligi va SSR/klient
 * natijasi bir xil bo'lishi uchun.
 */
export function formatDateUz(value?: string | null): string {
  if (!value) return "—";
  const parsed = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!parsed) return value;
  const [, year, month, day] = parsed;
  return `${Number(day)}-${MONTHS_UZ[Number(month) - 1]}, ${year}-yil`;
}

const MONTHS_SHORT_UZ = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
];

/**
 * "2026-12-01" → "1-dek 2026" — kartochka va tor ustunlarda joy tejash uchun.
 * To'liq shakl uchun `formatDateUz` ishlatiladi.
 */
export function formatDateShortUz(value?: string | null): string {
  if (!value) return "—";
  const parsed = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!parsed) return value;
  const [, year, month, day] = parsed;
  return `${Number(day)}-${MONTHS_SHORT_UZ[Number(month) - 1]} ${year}`;
}

/** "2026-08" → "2026-yil, avgust" */
export function formatMonthUz(value: string): string {
  const parsed = /^(\d{4})-(\d{2})$/.exec(value);
  if (!parsed) return value;
  return `${parsed[1]}-yil, ${MONTHS_UZ[Number(parsed[2]) - 1] ?? parsed[2]}`;
}

/** Joriy oy, hisobot formasi uchun boshlang'ich qiymat: "2026-07" */
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** So'nggi 12 oy, eng yangisi birinchi — hisobot oyini tanlash uchun */
export function recentMonthKeys(count = 12): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

/** "Qo'zi #a3f9c1" ko'rinishidagi qisqa shaxsiy raqam */
export function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

// ============================================================
// Chorva holati — bosqichlar zanjiri
// ============================================================

/**
 * Qo'zining hayot sikli. Zanjir FAQAT oldinga harakatlanadi: ortga qaytish yo'q.
 * `cancelled` bu zanjirda yo'q — u oqimdan chiqib ketish (faqat "listed" dan).
 */
export const LIVESTOCK_PIPELINE: LivestockStatus[] = [
  "listed",
  "funded",
  "in_care",
  "ready_for_sale",
  "sold",
];

interface StatusMeta {
  /** Jadval va nishonlarda ko'rinadigan qisqa nom */
  label: string;
  /** Bosqichning ma'nosi — qadamlar zanjiri ostida ko'rsatiladi */
  description: string;
  /** Rang tokeni (globals.css dagi ordinal ramp) */
  colorVar: string;
}

export const LIVESTOCK_STATUS: Record<LivestockStatus, StatusMeta> = {
  listed: {
    label: "E'londa",
    description: "Qo'zi bozorda ko'rinmoqda va investor sarmoyasini kutmoqda.",
    colorVar: "--stage-1",
  },
  funded: {
    label: "Sarmoya jalb qilindi",
    description:
      "Investor pulni to'ladi va u kafolat hisobida (escrow) saqlanmoqda. Endi parvarishni boshlashingiz mumkin.",
    colorVar: "--stage-2",
  },
  in_care: {
    label: "Parvarishda",
    description:
      "Qo'zi sizning nazoratingizda boqilmoqda. Har oy vazn hisobotini yuborib borasiz.",
    colorVar: "--stage-3",
  },
  ready_for_sale: {
    label: "Sotuvga tayyor",
    description:
      "Qo'zi belgilangan vaznga yetdi. Sotuv va foyda taqsimotini administrator yakunlaydi.",
    colorVar: "--stage-4",
  },
  sold: {
    label: "Sotildi",
    description: "Sotuv yakunlandi va foyda taraflar o'rtasida taqsimlandi.",
    colorVar: "--stage-5",
  },
  cancelled: {
    label: "Bekor qilingan",
    description: "E'lon bozordan olib tashlangan. Bu holatni qaytarib bo'lmaydi.",
    colorVar: "--stage-off",
  },
};

/**
 * Fermer o'zi bosishi mumkin bo'lgan yagona keyingi qadam.
 *
 * Backend `FARMER_ALLOWED_TRANSITIONS` bilan mos, ammo bu yerda ortga qaytish
 * (ready_for_sale → in_care) atayin berilmagan: interfeysda zanjir bir tomonlama.
 */
export const FARMER_NEXT_STEP: Partial<
  Record<LivestockStatus, { to: LivestockStatus; action: string; confirm: string }>
> = {
  funded: {
    to: "in_care",
    action: "Parvarishni boshlash",
    confirm:
      "Qo'zi «sarmoya jalb qilindi» bosqichidan «parvarishda» bosqichiga o'tadi. Bu qadamni ortga qaytarib bo'lmaydi.",
  },
  in_care: {
    to: "ready_for_sale",
    action: "Sotuvga tayyor deb belgilash",
    confirm:
      "Qo'zi sotuvga tayyor deb belgilanadi va administrator sotuvni yakunlashi mumkin bo'ladi. Bu qadamni ortga qaytarib bo'lmaydi.",
  },
};

/** Navbat fermerda emas — kim harakat qilishini kutayotganini tushuntiradi. */
export const WAITING_ON: Partial<Record<LivestockStatus, string>> = {
  listed: "Investor sarmoya kiritishini kutmoqdasiz — bu qadamni siz bajarmaysiz.",
  ready_for_sale: "Sotuvni administrator yakunlaydi — bu qadamni siz bajarmaysiz.",
};

/** Oylik hisobot talab qilinadigan bosqichlar */
export const REPORTABLE_STATUSES: LivestockStatus[] = [
  "funded",
  "in_care",
  "ready_for_sale",
];

export function isPipelineComplete(status: LivestockStatus): boolean {
  return status === "sold" || status === "cancelled";
}

// ============================================================
// Ferma tekshiruvi va KYC
// ============================================================

export const FARM_VERIFICATION: Record<
  FarmVerificationStatus,
  { label: string; description: string; tone: "neutral" | "progress" | "done" | "bad" }
> = {
  pending: {
    label: "Tekshiruvda",
    description: "Hujjatlaringiz ko'rib chiqilmoqda. Hozircha qo'zi qo'sha olmaysiz.",
    tone: "neutral",
  },
  vet_approved: {
    label: "Veterinar tasdiqladi",
    description: "Veterinar xulosasi olindi. Platforma yakuniy tasdig'i kutilmoqda.",
    tone: "progress",
  },
  platform_approved: {
    label: "Tasdiqlangan",
    description: "Ferma to'liq tasdiqlangan — qo'zi qo'shishingiz mumkin.",
    tone: "done",
  },
  rejected: {
    label: "Rad etilgan",
    description: "Ferma rad etildi. Sabab va keyingi qadamlar uchun qo'llab-quvvatlashga murojaat qiling.",
    tone: "bad",
  },
};

export const KYC_STATUS: Record<KycStatus, string> = {
  not_submitted: "Topshirilmagan",
  pending: "Tekshiruvda",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};

// ============================================================
// Rollar, escrow va tranzaksiyalar
// ============================================================

export const USER_ROLE: Record<UserRole, string> = {
  investor: "Investor",
  farmer: "Fermer",
  vet: "Veterinar",
  admin: "Administrator",
};

export const ESCROW_STATUS: Record<EscrowStatus, string> = {
  pending: "Kafolat hisobida",
  released_to_farmer: "Fermerga o'tkazildi",
  sale_completed: "Sotuv yakunlandi",
  payout_completed: "To'lov yakunlandi",
  refunded: "Mablag' qaytarildi",
};

/**
 * Investor puli bosib o'tadigan zanjir. `refunded` bu zanjirda yo'q — u
 * oqimdan chiqib ketish, xuddi chorvadagi `cancelled` kabi.
 */
export const ESCROW_PIPELINE: EscrowStatus[] = [
  "pending",
  "released_to_farmer",
  "sale_completed",
  "payout_completed",
];

/** Investorga bosqich nimani anglatishini tushuntiradi */
export const ESCROW_DESCRIPTION: Record<EscrowStatus, string> = {
  pending: "Pul kafolat hisobida turibdi, fermer parvarishni boshlashini kutmoqda.",
  released_to_farmer: "Pul fermerga o'tkazildi, qo'zi parvarishda.",
  sale_completed: "Chorva sotildi, foyda taqsimoti tayyorlanmoqda.",
  payout_completed: "Ulushingiz to'liq to'landi — bitim yakunlandi.",
  refunded: "Mablag' sizga qaytarildi.",
};

/** Bosqich ranglari — globals.css dagi ordinal yashil ramp */
export const ESCROW_STAGE_COLOR: Record<EscrowStatus, string> = {
  pending: "--stage-1",
  released_to_farmer: "--stage-2",
  sale_completed: "--stage-3",
  payout_completed: "--stage-4",
  refunded: "--stage-off",
};

export const TRANSACTION_TYPE: Record<Transaction["type"], string> = {
  escrow_deposit: "Kafolat hisobiga to'lov",
  farmer_payout: "Fermerga o'tkazma",
  sale_proceeds: "Sotuvdan tushum",
  profit_distribution: "Foyda taqsimoti",
  platform_fee: "Platforma komissiyasi",
  refund: "Pul qaytarilishi",
};

export const TRANSACTION_STATUS: Record<Transaction["status"], string> = {
  pending: "Kutilmoqda",
  completed: "Bajarildi",
  failed: "Amalga oshmadi",
};

// Xato matnlarini o'zbekchalashtirish `lib/apiError.ts` ga ko'chirildi —
// u yerda HTTP statusi va freymvorkning inglizcha matnlari ham hisobga olinadi.
