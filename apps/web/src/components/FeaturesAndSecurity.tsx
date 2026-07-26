import { ShieldCheck, Stethoscope, Scale, FileCheck, CheckCircle2 } from "lucide-react";

export function FeaturesAndSecurity() {
  const features = [
    {
      title: "Escrow Pul Muhofazasi",
      description: "Sarmoyangiz bevosita fermer cho'ntagiga tushmaydi. Pul platformaning Escrow hisobida saqlanadi va veterinar tasdiqlaganidan keyin chiqariladi.",
      icon: ShieldCheck,
    },
    {
      title: "Mustaqil Veterinar Ko'rigi",
      description: "Har bir chorva platformaga qo'shilishidan oldin va boqish jarayonida malakali veterinar tomonidan doimiy ko'rikdan o'tkaziladi.",
      icon: Stethoscope,
    },
    {
      title: "Haqiqiy Vazn va Hisobotlar",
      description: "Tizimda taxminiy sonlar ishlatilmaydi. Har oy tarozida tortilgan aniq vazn va rasm-fotolar tizimga yuklanadi.",
      icon: Scale,
    },
    {
      title: "Yuridik Kuchga Ega Shartnoma",
      description: "Har bir investitsiya bitimi platforma, investor va fermer o'rtasida elektron shartnoma bilan mustahkamlanadi.",
      icon: FileCheck,
    },
  ];

  return (
    <section id="features" className="scroll-mt-24 py-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent rounded-3xl p-8 sm:p-12 border border-emerald-500/10">
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-300 dark:border-emerald-800">
            Kafolat va Ishonch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Nega Aynan Livestock Invest?
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base">
            Biz an'anaviy chorvachilikni zamonaviy moliyaviy texnologiyalar (FinTech) bilan birlashtirib, investor va fermerlar uchun teng manfaatlarni ta'minlaymiz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white flex-shrink-0 shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    {feature.title}
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
