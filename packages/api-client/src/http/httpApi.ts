import type {
  AdminDashboard,
  KycSubmission,
  KycSubmissionWithUser,
  MonthlyReport,
  PublicProfile,
  User,
  VetProfile,
  VetReport,
} from "@livestock-invest/shared-types";
import type { LivestockInvestApi } from "../types";
import { apiRequest } from "./httpClient";
import { tokenStore } from "./tokenStore";
import {
  mapFarm,
  mapInvestment,
  mapLivestock,
  mapMyProfile,
  mapRoleProfile,
  mapTransaction,
} from "./mappers";

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const qs = new URLSearchParams(entries as [string, string][]).toString();
  return `?${qs}`;
}

export const httpApi: LivestockInvestApi = {
  auth: {
    async register(input) {
      const result = await apiRequest<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body: input,
        auth: false,
      });
      tokenStore.set(result.token);
      return result;
    },
    async login(phone, password) {
      const result = await apiRequest<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: { phone, password },
        auth: false,
      });
      tokenStore.set(result.token);
      return result;
    },
    async me() {
      if (!tokenStore.get()) return null;
      try {
        return await apiRequest<User>("/auth/me");
      } catch {
        tokenStore.clear();
        return null;
      }
    },
  },

  users: {
    async me() {
      const raw = await apiRequest<any>("/users/me");
      return mapMyProfile(raw);
    },
    async updateMe(input) {
      return apiRequest<User>("/users/me", { method: "PATCH", body: input });
    },
    async changePassword(input) {
      return apiRequest<{ message: string }>("/users/me/password", {
        method: "PATCH",
        body: input,
      });
    },
    async updateRoleProfile(input) {
      const raw = await apiRequest<any>("/users/me/profile", {
        method: "PATCH",
        body: input,
      });
      return mapRoleProfile(raw);
    },
    async submitKyc(input) {
      return apiRequest<KycSubmission>("/users/me/kyc", {
        method: "POST",
        body: input,
      });
    },
    async myKycHistory() {
      return apiRequest<KycSubmission[]>("/users/me/kyc");
    },
    async getPublicProfile(id) {
      try {
        return await apiRequest<PublicProfile>(`/users/${id}`, { auth: false });
      } catch {
        return null;
      }
    },
  },

  farms: {
    async list(filters) {
      const qs = buildQuery({ region: filters?.region, status: filters?.status });
      const raw = await apiRequest<any[]>(`/farms${qs}`, { auth: false });
      return raw.map(mapFarm);
    },
    async getById(id) {
      try {
        const raw = await apiRequest<any>(`/farms/${id}`, { auth: false });
        return mapFarm(raw);
      } catch {
        return null;
      }
    },
    async mine() {
      const raw = await apiRequest<any[]>("/farms/mine");
      return raw.map(mapFarm);
    },
    async create(input) {
      const raw = await apiRequest<any>("/farms", { method: "POST", body: input });
      return mapFarm(raw);
    },
    async update(id, input) {
      const raw = await apiRequest<any>(`/farms/${id}`, { method: "PATCH", body: input });
      return mapFarm(raw);
    },
    async verify(id, status) {
      const raw = await apiRequest<any>(`/farms/${id}/verify`, {
        method: "PATCH",
        body: { status },
      });
      return mapFarm(raw);
    },
  },

  livestock: {
    async list(filters) {
      const qs = buildQuery({ status: filters?.status, farmId: filters?.farmId });
      const raw = await apiRequest<any[]>(`/livestock${qs}`, { auth: false });
      return raw.map(mapLivestock);
    },
    async getById(id) {
      try {
        const raw = await apiRequest<any>(`/livestock/${id}`, { auth: false });
        return mapLivestock(raw);
      } catch {
        return null;
      }
    },
    async mine() {
      const raw = await apiRequest<any[]>("/livestock/mine");
      return raw.map(mapLivestock);
    },
    async create(input) {
      const raw = await apiRequest<any>("/livestock", { method: "POST", body: input });
      return mapLivestock(raw);
    },
    async updateStatus(id, status) {
      const raw = await apiRequest<any>(`/livestock/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      return mapLivestock(raw);
    },
    async getMonthlyReports(id) {
      return apiRequest<MonthlyReport[]>(`/livestock/${id}/monthly-reports`, { auth: false });
    },
    async getVetReports(id) {
      return apiRequest<VetReport[]>(`/livestock/${id}/vet-reports`, { auth: false });
    },
    async addMonthlyReport(id, input) {
      return apiRequest<MonthlyReport>(`/livestock/${id}/monthly-reports`, {
        method: "POST",
        body: input,
      });
    },
    async addVetReport(id, input) {
      return apiRequest<VetReport>(`/livestock/${id}/vet-reports`, {
        method: "POST",
        body: input,
      });
    },
  },

  investments: {
    async listMine() {
      const raw = await apiRequest<any[]>("/investments/mine");
      return raw.map(mapInvestment);
    },
    async getById(id) {
      try {
        const raw = await apiRequest<any>(`/investments/${id}`);
        return mapInvestment(raw);
      } catch {
        return null;
      }
    },
    async getTransactions(id) {
      const raw = await apiRequest<any[]>(`/investments/${id}/transactions`);
      return raw.map(mapTransaction);
    },
    async create(input) {
      const raw = await apiRequest<any>("/investments", { method: "POST", body: input });
      return mapInvestment(raw);
    },
    async releaseToFarmer(id) {
      const raw = await apiRequest<any>(`/investments/${id}/release-to-farmer`, {
        method: "PATCH",
      });
      return mapInvestment(raw);
    },
    async completeSale(id, input) {
      const raw = await apiRequest<any>(`/investments/${id}/complete-sale`, {
        method: "PATCH",
        body: input,
      });
      return mapInvestment(raw);
    },
    async completePayout(id) {
      const raw = await apiRequest<any>(`/investments/${id}/complete-payout`, {
        method: "PATCH",
      });
      return mapInvestment(raw);
    },
  },

  admin: {
    async getDashboard() {
      const raw = await apiRequest<any>("/admin/dashboard");
      return {
        ...raw,
        investments: {
          ...raw.investments,
          awaitingEscrowRelease: raw.investments.awaitingEscrowRelease.map(mapInvestment),
          awaitingSaleCompletion: raw.investments.awaitingSaleCompletion.map(mapInvestment),
          awaitingPayout: raw.investments.awaitingPayout.map(mapInvestment),
        },
        farms: {
          ...raw.farms,
          pending: raw.farms.pending.map(mapFarm),
        },
      } as AdminDashboard;
    },
    async listUsers(role) {
      const qs = buildQuery({ role });
      return apiRequest<User[]>(`/admin/users${qs}`);
    },
    async updateUserRole(userId, role) {
      return apiRequest<User>(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
    },
    async setUserActive(userId, isActive) {
      return apiRequest<User>(`/admin/users/${userId}/active`, {
        method: "PATCH",
        body: { isActive },
      });
    },
    async listKyc(status) {
      const qs = buildQuery({ status });
      return apiRequest<KycSubmissionWithUser[]>(`/admin/kyc${qs}`);
    },
    async reviewKyc(submissionId, input) {
      return apiRequest<KycSubmission>(`/admin/kyc/${submissionId}`, {
        method: "PATCH",
        body: input,
      });
    },
    async verifyVetLicense(vetUserId, isVerified) {
      return apiRequest<VetProfile>(`/admin/vets/${vetUserId}/license`, {
        method: "PATCH",
        body: { isVerified },
      });
    },
  },
};
