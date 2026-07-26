import type {
  AdminDashboard,
  Farm,
  FarmVerificationStatus,
  Investment,
  Livestock,
  LivestockStatus,
  MonthlyReport,
  Transaction,
  User,
  VetReport,
} from "@livestock-invest/shared-types";

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
      role: "investor" | "farmer";
      password: string;
    }): Promise<{ user: User; token: string }>;
    login(phone: string, password: string): Promise<{ user: User; token: string }>;
    me(): Promise<User | null>;
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
    listUsers(role?: string): Promise<User[]>;
    updateUserRole(userId: string, role: string): Promise<User>;
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
