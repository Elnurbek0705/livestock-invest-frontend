import { ShieldCheck, Stethoscope, Scale, FileCheck } from "lucide-react";
import { SectionHeading, sectionClass } from "@/components/landing/SectionHeading";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Escrow muhofazasi",
    text: "Pul fermerga to'g'ridan-to'g'ri tushmaydi — kafolat hisobida saqlanadi.",
  },
  {
    icon: Stethoscope,
    title: "Mustaqil veterinar",
    text: "Chorva platformaga qo'shilishdan oldin ham, boqish davomida ham ko'rikdan o'tadi.",
  },
  {
    icon: Scale,
    title: "Tarozidagi haqiqiy vazn",
    text: "Taxminiy son yo'q: har oy o'lchangan kg va surat tizimga yuklanadi.",
  },
  {
    icon: FileCheck,
    title: "Elektron shartnoma",
    text: "Har bir bitim investor, fermer va platforma o'rtasida rasmiylashtiriladi.",
  },
];

export function FeaturesAndSecurity() {
  return (
    <section id="features" className={sectionClass}>
      <SectionHeading
        title="Nega Livestock Invest?"
        subtitle="Sarmoyani himoyalaydigan to'rtta mexanizm"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-zinc-900"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  {feature.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
