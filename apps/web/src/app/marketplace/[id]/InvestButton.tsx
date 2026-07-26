"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiClient } from "@livestock-invest/api-client";
import { ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export function InvestButton({ livestockId }: { livestockId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvest() {
    if (!user) {
      router.push(`/login?redirect=/marketplace/${livestockId}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const api = getApiClient();
      await api.investments.create({ livestockId });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/investments/mine");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Investitsiya qilishda xatolik. Tizimga kirganingizga ishonch hosil qiling.",
      );
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-lg animate-pulse">
        <CheckCircle2 className="h-5 w-5" />
        Investitsiya Amalga Oshirildi! Qayta yo'naltirilmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleInvest}
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Escrow Bitimi Yaratilmoqda...
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            {user ? "Hozir Investitsiya Qilish" : "Investitsiya Uchun Kirish"}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
