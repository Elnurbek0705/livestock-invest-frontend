import { Search, ShieldCheck, Activity, Coins } from "lucide-react";
import { SectionHeading, sectionClass } from "@/components/landing/SectionHeading";

/**
 * To'rt bosqich — har biriga bitta jumla.
 *
 * Ilgari har bosqichda nishon, sarlavha va uch qatorli tavsif bor edi;
 * bosqichlar mohiyati esa bir jumlaga sig'adi. Matn qisqarganda zanjir
 * ko'rinishi ham o'qilishi ham osonlashadi.
 */
const STEPS = [
  {
    icon: Search,
    title: "Qo'zini tanlaysiz",
    text: "Bozordan veterinar ko'rigidan o'tgan qo'zini tanlaysiz.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow'ga to'laysiz",
    text: "Pul kafolat hisobida turadi, fermerga bosqichma-bosqich o'tadi.",
  },
  {
    icon: Activity,
    title: "Parvarishni kuzatasiz",
    text: "Har oy vazn o'lchovi va veterinar xulosasi kabinetingizda.",
  },
  {
    icon: Coins,
    title: "Foyda taqsimlanadi",
    text: "Sotuvdan keyin tushum shartnomadagi ulushingizga mos bo'linadi.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={sectionClass}>
      <SectionHeading
        title="Qanday ishlaydi?"
        subtitle="Chorvachilikni bilmasangiz ham — to'rt qadam"
      />

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-bold tabular-nums text-stone-300 dark:text-stone-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {step.text}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
