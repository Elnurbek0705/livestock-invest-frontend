import Link from "next/link";
import { Sprout, ShieldCheck, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-300 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                <Sprout className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Livestock<span className="text-emerald-500">Invest</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              O'zbekistonda chorvachilik tarmog'ini raqamlashtirish, investorlar uchun Escrow kafolatli halol daromad va fermerlar uchun sarmoya platformasi.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="h-4 w-4" />
              Escrow Kafolati Ostida
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Navigatsiya</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Marketplace — Barcha qo'zilar
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">
                  Qanday ishlaydi?
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-emerald-400 transition-colors">
                  Investitsiya Kalkulyatori
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-400 transition-colors">
                  Escrow va Xavfsizlik
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & For Farmers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fermerlar va Hamkorlar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?role=farmer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Fermer sifatida a'zo bo'lish
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </Link>
              </li>
              <li>
                <span className="text-zinc-400">Veterinar nazorati standartlari</span>
              </li>
              <li>
                <span className="text-zinc-400">Escrow va shartnoma shartlari</span>
              </li>
              <li>
                <span className="text-zinc-400">Boqish va semirtirish davri</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aloqa</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-zinc-400">
                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Toshkent sh., Yunusobod tumani</span>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-400">
                <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>+998 (71) 200-00-00</span>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-400">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>info@livestockinvest.uz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Livestock Invest. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Foydalanish shartlari</span>
            <span className="hover:underline cursor-pointer">Maxfiylik siyosati</span>
            <span className="hover:underline cursor-pointer">Escrow Nizomi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
