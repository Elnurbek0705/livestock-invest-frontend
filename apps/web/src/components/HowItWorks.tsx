import { Search, ShieldCheck, Activity, Coins, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Chorvani Tanlang",
      description: "Marketplace katalogidan veterinar tomonidan tekshirilgan va sertifikatlangan qo'zi hamda zotdor chorvalarni ko'rib chiqing.",
      icon: Search,
      badge: "Katalog",
    },
    {
      number: "02",
      title: "Escrow orqali Sarmoya Kiritish",
      description: "Mablag'ingiz xavfsiz Escrow hisobida saqlanadi. Pul faqat chorva ferma parvarishiga o'tgandan so'ng fermerga bosqichma-bosqich o'tkaziladi.",
      icon: ShieldCheck,
      badge: "100% Xavfsiz",
    },
    {
      number: "03",
      title: "Oylik Vazn va Salomatlik Nazorati",
      description: "Har oy veterinar xulosasi, jonli vazn o'lchovlari va rasm-videoli hisobotlarni shaxsiy kabinetingizda kuzatib borasiz.",
      icon: Activity,
      badge: "Shaffoflik",
    },
    {
      number: "04",
      title: "Sotuv va Foyda Taqsimoti",
      description: "Semirtirish davri tugagach, chorva bozorda sotiladi va foyda shartnomadagi ulushingizga mos ravishda hisobingizga kelib tushadi.",
      icon: Coins,
      badge: "Halol Daromad",
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-3">
          Oddiy va Shaffof Bosqichlar
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Livestock Invest Qanday Ishlaydi?
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base">
          Chorvachilik bilimiga ega bo'lmasdan turib ham professional fermalarga sarmoya kiritish va kafolatlangan ulush olish mexanizmi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 font-bold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-zinc-300 dark:text-zinc-700">
                    {step.number}
                  </span>
                </div>

                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  {step.badge}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
