// ============================================================
// Foydalanuvchi rollari
// ============================================================

export type UserRole = "investor" | "farmer" | "vet" | "admin";

export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string | null;
  kycStatus: KycStatus;
  isSuperAdmin?: boolean;
  createdAt: string;
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
