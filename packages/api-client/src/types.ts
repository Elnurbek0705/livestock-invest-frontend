import type {
  AdminDashboard,
  AdminVetRow,
  Farm,
  FarmVerificationStatus,
  Investment,
  KycSubmission,
  KycSubmissionStatus,
  KycSubmissionWithUser,
  Livestock,
  LivestockStatus,
  MonthlyReport,
  MyProfile,
  PublicProfile,
  RegisterableRole,
  RoleProfile,
  Transaction,
  User,
  UserRole,
  VetProfile,
  VetReport,
} from "@livestock-invest/shared-types";

/**
 * Rolga xos profil maydonlari. Backendda bitta DTO, lekin har bir maydon
 * faqat MA'LUM bir rolga tegishli — begona maydon yuborilsa 400 qaytadi
 * (users.service.ts, ROLE_PROFILE_FIELDS).
 *
 * Shuning uchun bu yerda ham rollar bo'yicha ajratilgan: aralash to'plam
 * (masalan fermerning `region` i bilan investorning `targetBudgetUzs` i)
 * birorta a'zoga ham mos kelmaydi va TypeScript darrov xato beradi —
 * so'rov yuborilib, backenddan xato kutib o'tirilmaydi.
 */
export interface InvestorProfileUpdate {
  bio?: string;
  preferredRegions?: string[];
  targetBudgetUzs?: number;
  notifyOnNewListing?: boolean;
  notifyOnMonthlyReport?: boolean;
}

export interface FarmerProfileUpdate {
  bio?: string;
  experienceYears?: number;
  specialization?: string;
  region?: string;
  district?: string;
}

export interface VetProfileUpdate {
  licenseNumber?: string;
  /** YYYY-MM-DD */
  licenseExpiresAt?: string;
  specialization?: string;
  experienceYears?: number;
  organization?: string;
  serviceRegions?: string[];
}

/** Admin roli uchun qo'shimcha profil maydonlari yo'q — backend 400 qaytaradi. */
export type RoleProfileUpdate =
  | InvestorProfileUpdate
  | FarmerProfileUpdate
  | VetProfileUpdate;

/**
 * Bu interfeys "shartnoma" (contract) hisoblanadi.
 * Frontend shu interfeysga qarab ishlaydi — orqasida real backend
 * bo'lishidan qat'i nazar, frontend kodi o'zgarmaydi.
 *
 * Har bir metod imzosi backend'dagi haqiqiy endpoint'larga (NestJS) mos
 * qilib yozilgan — bu http implementatsiyasi frontend kodidan butunlay
 * yashiradi.
 */
export interface LivestockInvestApi {
  auth: {
    register(input: {
      fullName: string;
      phone: string;
      email?: string;
      role: RegisterableRole;
      password: string;
    }): Promise<{ user: User; token: string }>;
    login(phone: string, password: string): Promise<{ user: User; token: string }>;
    me(): Promise<User | null>;
  };

  users: {
    /** To'liq profil: umumiy maydonlar + rolga xos profil + KYC holati */
    me(): Promise<MyProfile>;
    /** Barcha rollar uchun umumiy maydonlar */
    updateMe(input: {
      fullName?: string;
      /** +998XXXXXXXXX — bu ayni paytda login identifikatori */
      phone?: string;
      email?: string;
      avatarUrl?: string;
    }): Promise<User>;
    changePassword(input: {
      currentPassword: string;
      /** kamida 8 ta belgi, joridan farq qilishi shart */
      newPassword: string;
    }): Promise<{ message: string }>;
    /** Rolga xos maydonlar — foydalanuvchining roliga mos to'plamni yuboring */
    updateRoleProfile(input: RoleProfileUpdate): Promise<RoleProfile>;
    submitKyc(input: {
      /** "AA1234567" */
      passportSeries: string;
      /** 14 xonali JSHSHIR */
      pinfl: string;
      /** YYYY-MM-DD */
      birthDate: string;
      passportPhotoUrl: string;
      /** Pasportni qo'lda ushlagan holdagi selfie */
      selfiePhotoUrl: string;
    }): Promise<KycSubmission>;
    /** O'z arizalari tarixi, eng yangisi birinchi */
    myKycHistory(): Promise<KycSubmission[]>;
    /** Boshqa foydalanuvchining ochiq profili (marketplace'da fermer/vet) */
    getPublicProfile(id: string): Promise<PublicProfile | null>;
  };

  farms: {
    list(filters?: { region?: string; status?: FarmVerificationStatus }): Promise<Farm[]>;
    getById(id: string): Promise<Farm | null>;
    mine(): Promise<Farm[]>; // faqat fermer
    create(input: { name: string; region: string; district?: string }): Promise<Farm>;
    update(id: string, input: { name?: string; region?: string; district?: string }): Promise<Farm>;
    verify(id: string, status: FarmVerificationStatus): Promise<Farm>; // faqat admin/vet
  };

  livestock: {
    list(filters?: { status?: LivestockStatus; farmId?: string }): Promise<Livestock[]>;
    getById(id: string): Promise<Livestock | null>;
    mine(): Promise<Livestock[]>; // faqat fermer
    create(input: {
      farmId: string;
      breed?: string;
      currentWeightKg: number;
      ageMonths?: number;
      priceUzs: number;
      offeredInvestorSharePercent?: number;
      expectedSaleDate: string;
      photoUrls?: string[];
    }): Promise<Livestock>;
    updateStatus(id: string, status: LivestockStatus): Promise<Livestock>;
    getMonthlyReports(id: string): Promise<MonthlyReport[]>;
    getVetReports(id: string): Promise<VetReport[]>;
    addMonthlyReport(
      id: string,
      input: { month: string; weightKg: number; notes: string; photoUrls?: string[] },
    ): Promise<MonthlyReport>;
    addVetReport(
      id: string,
      input: { weightKg: number; healthNotes: string },
    ): Promise<VetReport>;
  };

  investments: {
    listMine(): Promise<Investment[]>; // faqat investor
    getById(id: string): Promise<Investment | null>;
    getTransactions(id: string): Promise<Transaction[]>;
    create(input: { livestockId: string }): Promise<Investment>;
    releaseToFarmer(id: string): Promise<Investment>; // faqat admin
    completeSale(id: string, input: { saleAmountUzs: number; platformFeePercent?: number }): Promise<Investment>; // faqat admin
    completePayout(id: string): Promise<Investment>; // faqat admin
  };

  admin: {
    getDashboard(): Promise<AdminDashboard>;
    listUsers(role?: UserRole): Promise<User[]>;
    /** Adminni tayinlash/tushirish faqat super-adminga ochiq */
    updateUserRole(userId: string, role: UserRole): Promise<User>;
    /** false — hisobni bloklash. O'z hisobini bloklab bo'lmaydi. */
    setUserActive(userId: string, isActive: boolean): Promise<User>;
    listKyc(status?: KycSubmissionStatus): Promise<KycSubmissionWithUser[]>;
    reviewKyc(
      submissionId: string,
      input: {
        status: "approved" | "rejected";
        /** Rad etilganda MAJBURIY — kamida 5 ta belgi */
        rejectionReason?: string;
      },
    ): Promise<KycSubmission>;
    /**
     * Veterinarlar litsenziya ma'lumotlari bilan. `verified` berilmasa —
     * hammasi, `false` — tasdiq kutayotganlar, `true` — tasdiqlanganlar.
     */
    listVets(verified?: boolean): Promise<AdminVetRow[]>;
    /** Tasdiqlanmagan vet hisobot ham yoza olmaydi, ferma ham tekshira olmaydi */
    verifyVetLicense(vetUserId: string, isVerified: boolean): Promise<VetProfile>;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
