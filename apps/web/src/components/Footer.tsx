import { Sprout } from "lucide-react";

/**
 * Footer ataylab havolasiz.
 *
 * Bozor, "Qanday ishlaydi?", kalkulyator, kirish va ro'yxatdan o'tish —
 * hammasi yuqoridagi yopishib turuvchi navbarda bor. Ularni pastda
 * takrorlash sahifaga hech narsa qo'shmaydi, faqat matn ko'paytiradi.
 */
export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sprout className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-stone-900 dark:text-white">
              Livestock<span className="text-emerald-600 dark:text-emerald-500">Invest</span>
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              © {new Date().getFullYear()} · Chorva investitsiyalari platformasi
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:text-right">
          Ko'rsatilgan ulush foizi — shartnoma bo'yicha foyda taqsimoti ulushi,
          kafolatlangan daromad emas.
        </p>
      </div>
    </footer>
  );
}
