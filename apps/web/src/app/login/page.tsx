"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@livestock-invest/validation";
import { useAuthStore } from "@/lib/authStore";
import { PageTransition } from "@/components/PageTransition";
import { Sprout, Phone, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      await login(data.phone, data.password);
      router.push("/marketplace");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Kirishda xatolik yuz berdi. Malumotlarni qayta tekshiring.",
      );
    }
  }

  return (
    <PageTransition>
      <main className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Sprout className="h-7 w-7" />
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Tizimga Kirish
            </h1>
            <p className="text-xs text-zinc-500">
              Chorva investitsiyalari shaxsiy kabinetiga xush kelibsiz
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone input */}
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

            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Kirilmoqda...
                </>
              ) : (
                <>
                  Kirish <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-3">
            <p className="text-xs text-zinc-500">
              Hisobingiz yo'qmi?{" "}
              <Link href="/register" className="font-bold text-emerald-600 hover:underline">
                Ro'yxatdan o'ting
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Escrow muhofazasidagi xavfsiz tizim</span>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
