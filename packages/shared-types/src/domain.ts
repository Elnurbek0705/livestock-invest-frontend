// ============================================================
// Foydalanuvchi rollari
// ============================================================

export type UserRole = "investor" | "farmer" | "vet" | "admin";

/**
 * Ro'yxatdan o'tish formasida tanlash mumkin bo'lgan rollar.
 *
 * "admin" bu ro'yxatda ATAYLAB yo'q — admin rolini faqat mavjud super-admin
 * `PATCH /admin/users/:id/role` orqali bera oladi.
 *
 * "vet" ochiq: veterinar hisob ochgani bilan hech qanday ta'sirchan amalni
 * bajara olmaydi — hisobot yozish ham, ferma tekshirish ham litsenziyasi
 * admin tomonidan tasdiqlanishini talab qiladi.
 */
export type RegisterableRole = Exclude<UserRole, "admin">;

export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
  kycStatus: KycStatus;
  isSuperAdmin?: boolean;
  /** false — hisob bloklangan, login ishlamaydi */
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// Rolga xos profillar (GET /users/me → profile)
// ============================================================

export interface InvestorProfile {
  id: string;
  userId: string;
  bio?: string | null;
  preferredRegions: string[];
  targetBudgetUzs?: number | null;
  /** "Premium Investor" obunasi */
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  notifyOnNewListing: boolean;
  notifyOnMonthlyReport: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number | null;
  specialization?: string | null;
  region?: string | null;
  district?: string | null;
  /** "Premium Fermer" obunasi */
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VetProfile {
  id: string;
  userId: string;
  licenseNumber?: string | null;
  /** YYYY-MM-DD */
  licenseExpiresAt?: string | null;
  specialization?: string | null;
  experienceYears?: number | null;
  organization?: string | null;
  serviceRegions: string[];
  /**
   * Faqat admin o'zgartiradi. false bo'lsa vet hisobot yoza olmaydi.
   * licenseNumber o'zgartirilsa avtomatik false ga qaytadi.
   */
  isLicenseVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleProfile =
  | InvestorProfile
  | FarmerProfile
  | VetProfile
  | null; // admin uchun alohida profil yo'q

// ============================================================
// KYC — shaxsni tasdiqlash
// ============================================================

export type KycSubmissionStatus = "pending" | "approved" | "rejected";

export interface KycSubmission {
  id: string;
  userId: string;
  /** "AA1234567" */
  passportSeries: string;
  /** 14 xonali JSHSHIR */
  pinfl: string;
  /** YYYY-MM-DD */
  birthDate: string;
  passportPhotoUrl: string;
  selfiePhotoUrl: string;
  status: KycSubmissionStatus;
  rejectionReason?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

/**
 * Admin ro'yxatlarida ariza egasi ham birga keladi (backend `kyc.user` ni
 * JOIN qiladi). Adminga ism kerak — bitta UUID bilan arizani baholab
 * bo'lmaydi.
 */
export interface KycSubmissionWithUser extends KycSubmission {
  user: User;
}

/** GET /users/me javobi */
export interface MyProfile {
  user: User;
  profile: RoleProfile;
  kyc: {
    status: KycStatus;
    latestSubmission: KycSubmission | null;
  };
}

/** GET /users/:id javobi — boshqa foydalanuvchining ochiq profili */
export interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  isKycVerified: boolean;
  createdAt: string;
  // Fermer uchun qo'shimcha
  bio?: string | null;
  experienceYears?: number | null;
  specialization?: string | null;
  region?: string | null;
  district?: string | null;
  isPremium?: boolean;
  // Vet uchun qo'shimcha
  organization?: string | null;
  serviceRegions?: string[];
  isLicenseVerified?: boolean;
}

// ============================================================
// Fermer va ferma
// ============================================================

export type FarmVerificationStatus =
  | "pending"
  | "vet_approved"
  | "platform_approved"
  | "rejected";

export interface Farm {
  id: string;
  ownerUserId: string;
  name: string;
  region: string;
  district?: string | null;
  rating: number;
  verificationStatus: FarmVerificationStatus;
  isPremium: boolean;
  createdAt: string;
}

// ============================================================
// Chorva (qo'zi) — asosiy investitsiya ob'ekti
// ============================================================

export type LivestockStatus =
  | "listed"
  | "funded"
  | "in_care"
  | "ready_for_sale"
  | "sold"
  | "cancelled";

export interface Livestock {
  id: string;
  farmId: string;
  status: LivestockStatus;
  breed?: string | null;
  currentWeightKg: number;
  ageMonths?: number | null;
  priceUzs: number;
  offeredInvestorSharePercent: number;
  expectedSaleDate: string;
  photoUrls: string[];
  createdAt: string;
}

export interface VetReport {
  id: string;
  livestockId: string;
  vetUserId: string;
  weightKg: number;
  healthNotes: string;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  livestockId: string;
  month: string;
  weightKg: number;
  notes: string;
  photoUrls: string[];
  createdAt: string;
}

// ============================================================
// Investitsiya va Escrow oqimi
// ============================================================

export type EscrowStatus =
  | "pending"
  | "released_to_farmer"
  | "sale_completed"
  | "payout_completed"
  | "refunded";

export interface Investment {
  id: string;
  investorUserId: string;
  livestockId: string;
  amountUzs: number;
  escrowStatus: EscrowStatus;
  contractProfitSharePercent: number;
  saleAmountUzs?: number | null;
  platformFeePercent?: number | null;
  platformFeeUzs?: number | null;
  investorShareUzs?: number | null;
  farmerShareUzs?: number | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  investmentId: string;
  type:
    | "escrow_deposit"
    | "farmer_payout"
    | "sale_proceeds"
    | "profit_distribution"
    | "platform_fee"
    | "refund";
  amountUzs: number;
  status: "pending" | "completed" | "failed";
  recipientUserId?: string | null;
  createdAt: string;
}

// ============================================================
// Admin dashboard (GET /admin/dashboard javobi shakli)
// ============================================================

export interface AdminDashboard {
  farms: {
    pendingCount: number;
    pending: Farm[];
  };
  kyc: {
    pendingCount: number;
    pending: KycSubmissionWithUser[];
  };
  investments: {
    awaitingEscrowReleaseCount: number;
    awaitingEscrowRelease: Investment[];
    awaitingSaleCompletionCount: number;
    awaitingSaleCompletion: Investment[];
    awaitingPayoutCount: number;
    awaitingPayout: Investment[];
  };
  finance: {
    totalEscrowHeldUzs: number;
    totalPlatformFeeCollectedUzs: number;
    totalPayoutsCompletedUzs: number;
  };
}
