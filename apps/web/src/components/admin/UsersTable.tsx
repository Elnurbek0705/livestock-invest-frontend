"use client";

/**
 * Foydalanuvchilar ro'yxati.
 *
 * Rol o'zgartirish — sezgir amal, shuning uchun tanlash bilanoq bajarilmaydi:
 * so'rov tashqariga (`onRequestRoleChange`) uzatiladi va sahifa uni tasdiqlash
 * modali orqali o'tkazadi.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Users, X } from "lucide-react";
import type { User, UserRole } from "@livestock-invest/shared-types";
import { KYC_STATUS, USER_ROLE } from "@/lib/uz";
import { EmptyState, controlClass } from "@/components/dashboard/primitives";

const ROLES: UserRole[] = ["investor", "farmer", "vet", "admin"];
const PAGE_SIZE = 15;

export function UsersTable({
  users,
  onRequestRoleChange,
}: {
  users: User[];
  onRequestRoleChange: (user: User, role: UserRole) => void;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all" && user.role !== role) return false;
      if (!needle) return true;
      return [user.fullName, user.phone, user.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [users, query, role]);

  useEffect(() => {
    setPage(1);
  }, [query, role]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageUsers = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const roleTabs = useMemo(
    () => [
      { key: "all" as const, label: "Barchasi", count: users.length },
      ...ROLES.map((item) => ({
        key: item,
        label: USER_ROLE[item],
        count: users.filter((user) => user.role === item).length,
      })),
    ],
    [users],
  );

  const hasFilter = query.trim() !== "" || role !== "all";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 dark:border-stone-800">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism yoki telefon bo'yicha qidirish"
            aria-label="Foydalanuvchilar orasidan qidirish"
            className={`${controlClass} w-full pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRole(tab.key)}
              aria-pressed={role === tab.key}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                role === tab.key
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {tab.label}{" "}
              <span className="tabular-nums opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRole("all");
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" /> Tozalash
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Foydalanuvchi topilmadi"
          description="Tanlangan shartlarga mos yozuv yo'q. Filtrni kengaytirib ko'ring."
        />
      ) : (
        <>
          {/* Katta ekran: jadval */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <th scope="col" className="px-4 py-2.5 font-medium">Ism familiya</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Telefon</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Roli</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Shaxs tasdig'i</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Rolni o'zgartirish</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-stone-100 last:border-0 dark:border-stone-800/70"
                  >
                    <td className="px-4 py-2.5 font-medium text-stone-900 dark:text-white">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-stone-600 dark:text-stone-300">
                      {user.phone}
                    </td>
                    <td className="px-4 py-2.5 text-stone-600 dark:text-stone-300">
                      {USER_ROLE[user.role]}
                    </td>
                    <td className="px-4 py-2.5 text-stone-500 dark:text-stone-400">
                      {KYC_STATUS[user.kycStatus]}
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          onRequestRoleChange(user, event.target.value as UserRole)
                        }
                        aria-label={`${user.fullName} uchun rol`}
                        className={controlClass}
                      >
                        {ROLES.map((item) => (
                          <option key={item} value={item}>
                            {USER_ROLE[item]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kichik ekran */}
          <ul className="divide-y divide-stone-100 dark:divide-stone-800/70 md:hidden">
            {pageUsers.map((user) => (
              <li key={user.id} className="space-y-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
                    {user.phone} · {KYC_STATUS[user.kycStatus]}
                  </p>
                </div>
                <select
                  value={user.role}
                  onChange={(event) =>
                    onRequestRoleChange(user, event.target.value as UserRole)
                  }
                  aria-label={`${user.fullName} uchun rol`}
                  className={`${controlClass} w-full`}
                >
                  {ROLES.map((item) => (
                    <option key={item} value={item}>
                      {USER_ROLE[item]}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>

          {visible.length > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <span className="tabular-nums">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, visible.length)}
                </span>{" "}
                / jami <span className="tabular-nums">{visible.length}</span> ta
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Oldingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1 text-xs tabular-nums text-stone-600 dark:text-stone-300">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= pageCount}
                  aria-label="Keyingi sahifa"
                  className="rounded-lg border border-stone-200 p-1.5 text-stone-600 transition-colors enabled:hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:enabled:hover:bg-stone-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
