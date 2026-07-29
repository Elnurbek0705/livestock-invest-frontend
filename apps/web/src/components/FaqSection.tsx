"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading, sectionClass } from "@/components/landing/SectionHeading";

/**
 * Javoblar ataylab qisqa. Daromad haqidagi javobda aniq foiz va'da qilinmaydi —
 * huquqiy talab bo'yicha kafolatlangan daromad ko'rsatilishi mumkin emas.
 */
const FAQS = [
  {
    q: "Pulim qayerda saqlanadi?",
    a: "Sarmoyangiz platformaning escrow (kafolat) hisobida muzlatiladi. Fermerga u faqat chorvani qabul qilib, parvarishni boshlagandan keyin bosqichma-bosqich o'tkaziladi.",
  },
  {
    q: "Chorva kasallansa yoki nobud bo'lsa-chi?",
    a: "Har bir ferma va chorva veterinariya nazoratida bo'ladi. Kutilmagan hollarda zarar shartnomadagi tartibda ko'rib chiqiladi.",
  },
  {
    q: "Qancha foyda olaman?",
    a: "Aniq raqam oldindan ma'lum emas: daromad qo'zining vazn o'sishiga va sotuv paytidagi bozor narxiga bog'liq. Sizga tegadigan ulush foizi esa har bir e'londa oldindan ko'rsatiladi.",
  },
  {
    q: "Fermerman — qanday sarmoya jalb qilaman?",
    a: "Ro'yxatdan «Fermer» roli bilan o'ting va fermangiz ma'lumotlarini kiriting. Veterinar va administrator tasdiqlagach, bozorga o'z e'lonlaringizni joylashtirasiz.",
  },
  {
    q: "Hisobotlarni qayerdan ko'raman?",
    a: "«Investitsiyalarim» bo'limida har oygi vazn o'lchovi, suratlar va veterinar xulosasi ko'rinib turadi.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={sectionClass}>
      <SectionHeading title="Ko'p beriladigan savollar" />

      <div className="max-w-3xl divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-zinc-900">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 dark:text-white dark:hover:bg-stone-800/50"
                >
                  {faq.q}
                  <ChevronDown
                    aria-hidden
                    className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
              </h3>
              {isOpen && (
                <p className="px-4 pb-4 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
