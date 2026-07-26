"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@livestock-invest/validation";
import { useAuthStore } from "@/lib/authStore";
import { getRoleHomePath } from "@/lib/roleHome";
import { PageTransition } from "@/components/PageTransition";
import { Sprout, User as UserIcon, Phone, Mail, Lock, ArrowRight, Loader as Loader2, TrendingUp, Building2, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerUser = useAuthStore((s) => s.register);
  const [serverError, setServerError] = useState<string | null>(null);

  const initialRole = searchParams.get("role") === "farmer" ? "farmer" : "investor";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (searchParams.get("role") === "farmer") {
      setValue("role", "farmer");
    }
  }, [searchParams, setValue]);

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      await registerUser(data);
      const { user } = useAuthStore.getState();
      router.push(getRoleHomePath(user?.role ?? data.role));
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Ro'yxatdan o'tishda xatolik yuz berdi",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Role selector cards */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
          Qaysi rolida a'zo bo'lasiz?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("role", "investor")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
              selectedRole === "investor"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-bold shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <TrendingUp className="h-5 w-5 mb-1 text-emerald-600" />
            <span className="text-sm font-bold">Investor</span>
            <span className="text-[10px] opacity-75">Chorvaga sarmoya kiritish</span>
          </button>

          <button
            type="button"
            onClick={() => setValue("role", "farmer")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
              selectedRole === "farmer"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-bold shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <Building2 className="h-5 w-5 mb-1 text-emerald-600" />
            <span className="text-sm font-bold">Fermer</span>
            <span className="text-[10px] opacity-75">Sarmoya jalb qilish</span>
          </button>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          To'liq Ism va Familiya
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            {...register("fullName")}
            placeholder="Alisher Navoiy"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        {errors.fullName && (
          <p className="text-red-600 text-xs mt-1 font-medium">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Telefon raqam
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            {...register("phone")}
            type="tel"
            placeholder="+998901234567"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        {errors.phone && (
          <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Email (ixtiyoriy)
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            {...register("email")}
            type="email"
            placeholder="alisher@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-xs mt-1 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Parol
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            {...register("password")}
            type="password"
            placeholder="Kamida 6 ta belgi"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1 font-medium">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Yuborilmoqda...
          </>
        ) : (
          <>
            Ro'yxatdan O'tish <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <PageTransition>
      <main className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Sprout className="h-7 w-7" />
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Ro'yxatdan O'tish
            </h1>
            <p className="text-xs text-zinc-500">
              Yangi hisob yarating va platformadan foydalanishni boshlang
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10 text-zinc-400 text-sm">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" /> Yuklanmoqda...
              </div>
            }
          >
            <RegisterForm />
          </Suspense>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-3">
            <p className="text-xs text-zinc-500">
              Hisobingiz bormi?{" "}
              <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                Kirish
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ma'lumotlaringiz shaffof va maxfiy saqlanadi</span>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
