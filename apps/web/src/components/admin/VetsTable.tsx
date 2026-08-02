"use client";

/**
 * Veterinarlar va ularning litsenziyalari.
 *
 * Tasdiqlash — huquq beradigan amal: tasdiqlanmagan veterinar na hisobot
 * yoza oladi, na ferma tekshira oladi. Shuning uchun qaror uchun kerak
 * bo'lgan hamma narsa bir qatorda ko'rinadi: litsenziya raqami, amal
 * qilish muddati va ish joyi. Raqamsiz tasdiqlash mumkin emas — backend
 * ham buni rad etadi, shuning uchun tugma ham o'chirilgan holda turadi.
 */

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building,
  CalendarClock,
  Search,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import type { AdminVetRow } from "@livestock-invest/shared-types";
import { EmptyState, controlClass } from "@/components/dashboard/primitives";
import { formatDateShortUz } from "@/lib/uz";

type Filter = "pending" | "verified" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Tasdiq kutmoqda" },
  { key: "verified", label: "Tasdiqlangan" },
  { key: "all", label: "Barchasi" },
];

/** Muddati o'tgan litsenziyani tasdiqlab qo'ymaslik uchun ogohlantiramiz. */
function isExpired(licenseExpiresAt: string | null | undefined): boolean {
  if (!licenseExpiresAt) return false;
  return new Date(licenseExpiresAt) < new Date();
}

export function VetsTable({
  vets,
  onRequestVerify,
}: {
  vets: AdminVetRow[];
  onRequestVerify: (row: AdminVetRow, verify: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");

  const counts = useMemo(
    () => ({
      pending: vets.filter((v) => !v.profile?.isLicenseVerified).length,
      verified: vets.filter((v) => v.profile?.isLicenseVerified).length,
      all: vets.length,
    }),
    [vets],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vets.filter((row) => {
      const verified = row.profile?.isLicenseVerified ?? false;
      if (filter === "pending" && verified) return false;
      if (filter === "verified" && !verified) return false;
      if (!needle) return true;
      return [
        row.user.fullName,
        row.user.phone,
        row.profile?.licenseNumber ?? "",
        row.profile?.organization ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [vets, filter, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.key
                  ? "bg-emerald-700 text-white"
                  : "border border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              }`}
            >
              {item.label}
              <span
                className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                  filter === item.key
                    ? "bg-white/25"
                    : "bg-stone-100 dark:bg-stone-800"
                }`}
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism, telefon yoki litsenziya"
            className={`${controlClass} pl-9`}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={
            filter === "pending"
              ? "Tasdiq kutayotgan veterinar yo'q"
              : "Veterinar topilmadi"
          }
          description={
            filter === "pending"
              ? "Yangi veterinar ro'yxatdan o'tib, litsenziya raqamini kiritgach shu yerda ko'rinadi."
              : "Qidiruv yoki filtrga mos veterinar yo'q."
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => {
            const profile = row.profile;
            const verified = profile?.isLicenseVerified ?? false;
            const hasLicense = Boolean(profile?.licenseNumber);
            const expired = isExpired(profile?.licenseExpiresAt);

            return (
              <li
                key={row.user.id}
                className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {row.user.fullName}
                      </span>
                      {verified ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Tasdiqlangan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Tasdiq kutmoqda
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {row.user.phone}
                    </p>

                    <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <dt className="text-stone-500 dark:text-stone-400">
                          Litsenziya:
                        </dt>
                        <dd
                          className={`font-semibold tabular-nums ${
                            hasLicense
                              ? "text-stone-900 dark:text-stone-100"
                              : "text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {profile?.licenseNumber ?? "kiritilmagan"}
                        </dd>
                      </div>

                      {profile?.licenseExpiresAt && (
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5 text-stone-400" />
                          <dd
                            className={`font-semibold ${
                              expired
                                ? "text-red-600 dark:text-red-400"
                                : "text-stone-700 dark:text-stone-200"
                            }`}
                          >
                            {formatDateShortUz(profile.licenseExpiresAt)}
                            {expired && " — muddati o'tgan"}
                          </dd>
                        </div>
                      )}

                      {profile?.organization && (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-stone-400" />
                          <dd className="text-stone-700 dark:text-stone-200">
                            {profile.organization}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {verified ? (
                      <button
                        type="button"
                        onClick={() => onRequestVerify(row, false)}
                        className="rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950"
                      >
                        Tasdiqni bekor qilish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!hasLicense}
                        onClick={() => onRequestVerify(row, true)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Litsenziyani tasdiqlash
                      </button>
                    )}
                    {!hasLicense && !verified && (
                      <p className="max-w-[190px] text-right text-[11px] leading-snug text-stone-500 dark:text-stone-400">
                        Veterinar avval profilida litsenziya raqamini
                        kiritishi kerak.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
