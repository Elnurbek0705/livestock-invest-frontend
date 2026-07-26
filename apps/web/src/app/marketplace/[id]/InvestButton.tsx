"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiClient } from "@livestock-invest/api-client";
import { ArrowRight, Loader as Loader2, ShieldCheck, CircleCheck as CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast/ToastProvider";

interface InvestButtonProps {
  livestockId: string;
  priceUzs: number;
  breed: string | null | undefined;
  investorSharePercent: number;
}

export function InvestButton({ livestockId, priceUzs, breed, investorSharePercent }: InvestButtonProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleButtonClick() {
    if (!user) {
      router.push(`/login?redirect=/marketplace/${livestockId}`);
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      const api = getApiClient();
      await api.investments.create({ livestockId });
      setIsSuccess(true);
      toast.success("Sarmoyangiz Escrow hisobida muhofazaga olindi.", "Investitsiya Amalga Oshdi!");
      setTimeout(() => {
        router.push("/investments/mine");
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Investitsiya qilishda xatolik. Tizimga kirganingizga ishonch hosil qiling.";
      setError(message);
      toast.error(message, "Investitsiya Xatoligi");
      setIsSubmitting(false);
      setShowConfirm(false);
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
        onClick={handleButtonClick}
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

      <ConfirmModal
        isOpen={showConfirm}
        type="success"
        title="Investitsiyani Tasdiqlang"
        description={`Siz ${breed ?? "Zotdor Qo'zi"} uchun ${priceUzs.toLocaleString("uz-UZ")} so'm sarmoya kiritmoqchisiz. Sarmoyangiz Escrow hisobida xavfsiz saqlanadi va fermer o'z majburiyatini bajargandan keyingina o'tkaziladi. Investor foyda ulushingiz: ${investorSharePercent}%.`}
        confirmText="Tasdiqlab Investitsiya Qilish"
        cancelText="Bekor Qilish"
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!isSubmitting) setShowConfirm(false);
        }}
      />
    </div>
  );
}
