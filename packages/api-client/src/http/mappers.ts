import type {
  Farm,
  Investment,
  Livestock,
  MyProfile,
  RoleProfile,
  Transaction,
} from "@livestock-invest/shared-types";

/**
 * PostgreSQL'ning "bigint" ustunlari (priceUzs, amountUzs va h.k.) `pg`
 * drayveri orqali ba'zan JavaScript string sifatida qaytishi mumkin
 * (aniqlik yo'qolmasligi uchun standart xatti-harakat). Bu yerda ularni
 * aniq Number()ga o'tkazib, frontend uchun xavfsiz raqamlarga aylantiramiz.
 */
function toNumber(value: unknown): number {
  return typeof value === "string" ? Number(value) : (value as number);
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return toNumber(value);
}

export function mapLivestock(raw: any): Livestock {
  return {
    ...raw,
    priceUzs: toNumber(raw.priceUzs),
    currentWeightKg: toNumber(raw.currentWeightKg),
  };
}

export function mapFarm(raw: any): Farm {
  return {
    ...raw,
    rating: toNumber(raw.rating),
  };
}

export function mapInvestment(raw: any): Investment {
  return {
    ...raw,
    amountUzs: toNumber(raw.amountUzs),
    saleAmountUzs: toNumberOrNull(raw.saleAmountUzs),
    platformFeeUzs: toNumberOrNull(raw.platformFeeUzs),
    investorShareUzs: toNumberOrNull(raw.investorShareUzs),
    farmerShareUzs: toNumberOrNull(raw.farmerShareUzs),
  };
}

/**
 * Rolga xos profil. Faqat investorda bigint ustun bor
 * (`targetBudgetUzs`) — qolgan rollarda o'zgartiriladigan raqam yo'q.
 * Admin uchun profil yozuvining o'zi yo'q, shuning uchun null bo'lishi mumkin.
 */
export function mapRoleProfile(raw: any): RoleProfile {
  if (!raw) return null;
  if (raw.targetBudgetUzs === undefined) return raw;
  return { ...raw, targetBudgetUzs: toNumberOrNull(raw.targetBudgetUzs) };
}

export function mapMyProfile(raw: any): MyProfile {
  return { ...raw, profile: mapRoleProfile(raw.profile) };
}

export function mapTransaction(raw: any): Transaction {
  return {
    ...raw,
    amountUzs: toNumber(raw.amountUzs),
  };
}
