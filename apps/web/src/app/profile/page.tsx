"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { KYC_STATUS } from "@/lib/uz";
import { PageTransition } from "@/components/PageTransition";
import { LogoutButton } from "@/components/LogoutButton";
import {
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  LogOut,
  TrendingUp,
  Building2,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, loadCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      loadCurrentUser();
    }
  }, [isInitialized, loadCurrentUser]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <p className="text-zinc-500 text-sm">Shaxsiy profilni ko'rish uchun tizimga kiring.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
        >
          Kirish
        </Link>
      </div>
    );
  }

  const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
    investor: { label: "Investor", icon: TrendingUp, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
    farmer: { label: "Fermer", icon: Building2, color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
    vet: { label: "Veterinar", icon: Stethoscope, color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300" },
    admin: { label: "Admin", icon: ShieldAlert, color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
  };

  const currentRoleConfig = roleLabels[user.role] || roleLabels.investor;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <PageTransition>
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-2xl shadow-lg shadow-emerald-600/30">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {user.fullName}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${currentRoleConfig.color}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    {currentRoleConfig.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">ID: {user.id}</p>
              </div>
            </div>

            <LogoutButton
              redirectTo="/"
              className="flex w-fit items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" /> Chiqish
            </LogoutButton>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> Telefon Raqam
              </span>
              <span className="font-bold text-zinc-900 dark:text-white block">{user.phone}</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-600" /> Email Manzil
              </span>
              <span className="font-bold text-zinc-900 dark:text-white block">
                {user.email ?? "Ko'rsatilmadi"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Shaxs tasdig&apos;i (KYC)
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
                {KYC_STATUS[user.kycStatus]}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-emerald-600" /> A'zolik Sanasi
              </span>
              <span className="font-bold text-zinc-900 dark:text-white block">
                {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Navigation Links */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Tezkor Kabinet Havolalari</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.role === "investor" && (
              <Link
                href="/investments/mine"
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold text-sm flex items-center justify-between"
              >
                <span>Mening Investitsiyalarim</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </Link>
            )}

            {user.role === "farmer" && (
              <Link
                href="/farmer/dashboard"
                className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-bold text-sm flex items-center justify-between"
              >
                <span>Fermer Kabineti (Fermalar va Qo'zilar)</span>
                <Building2 className="h-4 w-4 text-blue-600" />
              </Link>
            )}

            {(user.role === "vet" || user.role === "admin") && (
              <Link
                href="/vet/dashboard"
                className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 font-bold text-sm flex items-center justify-between"
              >
                <span>Veterinariya Boshqaruvi</span>
                <Stethoscope className="h-4 w-4 text-teal-600" />
              </Link>
            )}

            {user.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 font-bold text-sm flex items-center justify-between"
              >
                <span>Admin Dashboard</span>
                <ShieldAlert className="h-4 w-4 text-purple-600" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
