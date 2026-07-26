"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Pulim Escrow hisobida qanday saqlanadi?",
      a: "Siz marketplace orqali investitsiya qilganingizda, mablag'ingiz platformaning xavfsiz Escrow tranzit hisobida muzlatiladi. Pul fermerga chorvani veterinariya ko'rigidan o'tkazib, shartnoma shartlarini bajargandan so'ng bosqichma-bosqich o'tkazib beriladi.",
    },
    {
      q: "Chorva kasallansa yoki nobud bo'lsa nima bo'ladi?",
      a: "Barcha ferma va chorvalar majburiy ravishda veterinariya nazoratida bo'ladi va sug'urta hamda kafolat fondi tizimi bilan muhofazalanadi. Kutilmagan hollarda zarar shartnoma nizomlariga binoan qayta qoplanadi.",
    },
    {
      q: "Kiritilgan investitsiyadan qancha foyda olaman?",
      a: "Daromadlilik tanlangan chorva zoti, boshlang'ich vazni va boqish muddatiga bog'liq (odatiy sikl 4-8 oy). O'rtacha yillik va siklik daromadlilik 25% dan 40% gacha yetishi mumkin. Sof foydaning 70% qismi investorga tegishli bo'ladi.",
    },
    {
      q: "Men o'zim fermerman, platformada qanday sarmoya jalb qilishim mumkin?",
      a: "Ro'yxatdan o'tishda 'Fermer' rolini tanlang va o'z fermangiz ma'lumotlarini kiriting. Platforma administratsiyasi va veterinarlar fermangizni joyida ko mezonlar bo'yicha tekshirib, tasdiqlagach, Marketplace'da o'z e'lonlaringizni joylashtirishingiz mumkin.",
    },
    {
      q: "Oylik hisobotlarni qanday kuzatib boraman?",
      a: "Shaxsiy kabinetingizdagi 'Mening investitsiyalarim' bo'limida har oy yangilanadigan vazn grafiklari, fotolar va veterinar tibbiy xulosalari real vaqt rejimida ko'rinib turadi.",
    },
  ];

  return (
    <section className="py-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <HelpCircle className="h-3.5 w-3.5" />
            Ko'p Beriladigan Savollar
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Savollaringizga Javoblar
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Investitsiya oqimi va kafolatlar bo'yicha eng muhim ma'lumotlar
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-zinc-900 dark:text-white hover:text-emerald-600 transition-colors"
                >
                  <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
