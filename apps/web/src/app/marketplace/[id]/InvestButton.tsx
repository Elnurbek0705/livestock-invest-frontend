"use client";

/**
 * Sarmoya kiritish maydoni.
 *
 * Bu yerda tugmadan tashqari rolga qarab holat ham bor. Sabab: backendda
 * `POST /investments` faqat investorga ochiq (`@Roles('investor')`). Ilgari
 * tugma hammaga ko'rinardi va fermer bosganda NestJS'ning ichki xatosi —
 * inglizcha "Forbidden resource" — foydalanuvchiga chiqib qolardi. Bajarib
 * bo'lmaydigan amalni taklif qilmaslik xatoni tarjima qilishdan yaxshiroq.
 *
 * Sahifaning o'zi server komponenti, foydalanuvchi roli esa faqat klientda
 * ma'lum — shuning uchun holat shu komponentda hal qilinadi.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiClient } from "@livestock-invest/api-client";
import { ArrowRight, CheckCircle2, Info, Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { errorText } from "@/lib/apiError";
import { USER_ROLE } from "@/lib/uz";

export function InvestButton({ livestockId }: { livestockId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvest() {
    setIsSubmitting(true);
    setError(null);
    try {
      await getApiClient().investments.create({ livestockId });
      setIsSuccess(true);
      setTimeout(() => router.push("/investments/mine"), 1200);
    } catch (err) {
      setError(errorText(err, "Sarmoya kiritishda xatolik yuz berdi."));
      setIsSubmitting(false);
    }
  }

  // Rol hali noma'lum — tugmani ko'rsatib, keyin uni almashtirib yubormaymiz.
  if (!isAuthInitialized) {
    return (
      <div
        aria-hidden
        className="h-11 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
      />
    );
  }

  if (isSuccess) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white">
        <CheckCircle2 className="h-4 w-4" />
        Bitim yaratildi — kabinetga o'tilmoqda
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/login?redirect=/marketplace/${livestockId}`)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
      >
        <ShieldCheck className="h-4 w-4" />
        Kirish va sarmoya kiritish
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  if (user.role !== "investor") {
    // Ikonka va matn — flex konteynerning atigi ikkita bolasi. Matnni
    // to'g'ridan-to'g'ri flex ichiga qo'ysa, uning har bir bo'lagi alohida
    // flex elementiga aylanadi va qator uzuq-yuluq bo'lib ketadi.
    return (
      <div className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
        <div className="space-y-1">
          <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-200">
            Sarmoya kiritish faqat investor hisobiga ochiq — siz{" "}
            {USER_ROLE[user.role].toLowerCase()} sifatida kirgansiz.
          </p>
          <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
            Investor hisobi kerak bo'lsa, administratorga murojaat qiling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleInvest}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Bitim yaratilmoqda...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Sarmoya kiritish
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
