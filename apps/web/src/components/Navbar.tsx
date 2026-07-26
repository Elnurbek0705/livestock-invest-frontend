"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import {
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  Calculator,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sprout,
  Building2,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, loadCurrentUser, logout, isInitialized } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      loadCurrentUser();
    }
  }, [isInitialized, loadCurrentUser]);

  const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/#how-it-works", label: "Qanday ishlaydi?", icon: ShieldCheck },
    { href: "/#calculator", label: "Kalkulyator", icon: Calculator },
    { href: "/#features", label: "Afzalliklar", icon: TrendingUp },
  ];

  const getDashboardLink = () => {
    if (user?.role === "investor") {
      return {
        href: "/investments/mine",
        label: "Investitsiyalar",
        icon: TrendingUp,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      };
    }

    if (user?.role === "farmer") {
      return {
        href: "/farmer/dashboard",
        label: "Fermer kabineti",
        icon: Building2,
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      };
    }

    if (user?.role === "vet") {
      return {
        href: "/vet/dashboard",
        label: "Vet panel",
        icon: Stethoscope,
        className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
      };
    }

    if (user?.role === "admin") {
      return {
        href: "/admin/dashboard",
        label: "Admin panel",
        icon: ShieldAlert,
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      };
    }

    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(16,24,40,0.06)] dark:border-emerald-500/10 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition-transform duration-200 group-hover:scale-105">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
              Livestock<span className="text-emerald-600">Invest</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
              Chorva investitsiyalari
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <>
              {dashboardLink && (
                <Link
                  href={dashboardLink.href}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${dashboardLink.className}`}
                >
                  <dashboardLink.icon className="h-4 w-4" />
                  {dashboardLink.label}
                </Link>
              )}

              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <UserIcon className="h-4 w-4 text-emerald-600" />
                  <span className="max-w-[110px] truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {user.fullName}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Chiqish"
                  className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                Ro'yxatdan o'tish
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
          aria-label="Menyu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 pb-6 pt-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-zinc-700 transition-colors hover:bg-emerald-50 dark:text-zinc-200 dark:hover:bg-emerald-950/40"
                >
                  <Icon className="h-5 w-5 text-emerald-600" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-2.5 font-semibold dark:bg-zinc-800"
                >
                  <UserIcon className="h-4 w-4 text-emerald-600" />
                  Profil: {user.fullName}
                </Link>

                {dashboardLink && (
                  <Link
                    href={dashboardLink.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-semibold shadow-sm ${dashboardLink.className}`}
                  >
                    <dashboardLink.icon className="h-4 w-4" />
                    {dashboardLink.label}
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 py-2.5 font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                >
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-zinc-300 py-2.5 font-semibold text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-emerald-600 py-2.5 font-semibold text-white shadow-md"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
