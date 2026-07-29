"use client";

/**
 * Fermer kabinetidagi uchta forma: ferma qo'shish, qo'zi qo'shish, oylik hisobot.
 * Uchalasi ham bitta modal qobig'idan foydalanadi.
 */

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import type { Farm, Livestock } from "@livestock-invest/shared-types";
import {
  currentMonthKey,
  formatMonthUz,
  formatUzsCompact,
  recentMonthKeys,
} from "@/lib/uz";
import { Field, inputClass } from "@/components/dashboard/primitives";
import { ModalShell, ModalSubmitButton } from "@/components/dashboard/ModalShell";

/** O'zbekiston viloyatlari — erkin matn o'rniga aniq ro'yxat */
const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Xorazm",
];

const COMMON_BREEDS = ["Hisor", "Qorako'l", "Jaydari", "Edilboy", "Romanov", "Tojik"];

// ============================================================
// 1. Ferma qo'shish
// ============================================================

export interface FarmInput {
  name: string;
  region: string;
  district: string;
}

export function FarmFormModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: FarmInput) => void;
}) {
  const [form, setForm] = useState<FarmInput>({
    name: "",
    region: REGIONS[0],
    district: "",
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          title="Yangi ferma qo'shish"
          description="Ferma qo'shilgach platforma uni tekshiradi. Tasdiqlangandan keyin qo'zi joylashingiz mumkin."
          onClose={onClose}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Ferma nomi">
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Masalan: Yusupov chorva xo'jaligi"
                className={inputClass}
              />
            </Field>

            <Field label="Viloyat">
              <select
                required
                value={form.region}
                onChange={(event) => setForm({ ...form, region: event.target.value })}
                className={inputClass}
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tuman" hint="Ixtiyoriy, lekin investorlar uchun foydali.">
              <input
                type="text"
                value={form.district}
                onChange={(event) => setForm({ ...form, district: event.target.value })}
                placeholder="Masalan: Parkent"
                className={inputClass}
              />
            </Field>

            <ModalSubmitButton
              isSubmitting={isSubmitting}
              idleText="Fermani saqlash"
              busyText="Saqlanmoqda..."
            />
          </form>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 2. Qo'zi qo'shish
// ============================================================

export interface LivestockInput {
  farmId: string;
  breed: string;
  currentWeightKg: number;
  ageMonths: number;
  priceUzs: number;
  offeredInvestorSharePercent: number;
  expectedSaleDate: string;
}

const DEFAULT_LIVESTOCK: LivestockInput = {
  farmId: "",
  breed: "Hisor",
  currentWeightKg: 35,
  ageMonths: 4,
  priceUzs: 3_500_000,
  offeredInvestorSharePercent: 70,
  expectedSaleDate: "",
};

export function LivestockFormModal({
  isOpen,
  isSubmitting,
  approvedFarms,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  /** Faqat platforma tasdiqlagan fermalar — boshqasiga qo'zi qo'shib bo'lmaydi */
  approvedFarms: Farm[];
  onClose: () => void;
  onSubmit: (input: LivestockInput) => void;
}) {
  const [form, setForm] = useState<LivestockInput>(DEFAULT_LIVESTOCK);

  // Modal ochilganda tanlangan ferma va sanani mavjud ma'lumotga moslaymiz.
  useEffect(() => {
    if (!isOpen) return;
    const inSixMonths = new Date();
    inSixMonths.setMonth(inSixMonths.getMonth() + 6);
    setForm((previous) => ({
      ...previous,
      farmId: approvedFarms[0]?.id ?? "",
      expectedSaleDate:
        previous.expectedSaleDate || inSixMonths.toISOString().slice(0, 10),
    }));
  }, [isOpen, approvedFarms]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  const farmerShare = 100 - form.offeredInvestorSharePercent;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell
          title="Yangi qo'zi e'loni"
          description="E'lon saqlangach qo'zi darhol bozorda ko'rinadi va investorlar sarmoya kirita oladi."
          onClose={onClose}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Ferma"
              hint="Ro'yxatda faqat platforma tasdiqlagan fermalar ko'rinadi."
            >
              <select
                required
                value={form.farmId}
                onChange={(event) => setForm({ ...form, farmId: event.target.value })}
                className={inputClass}
              >
                {approvedFarms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} — {farm.region}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Zoti">
              <input
                type="text"
                required
                list="breed-options"
                value={form.breed}
                onChange={(event) => setForm({ ...form, breed: event.target.value })}
                placeholder="Masalan: Hisor"
                className={inputClass}
              />
              <datalist id="breed-options">
                {COMMON_BREEDS.map((breed) => (
                  <option key={breed} value={breed} />
                ))}
              </datalist>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Joriy vazni (kg)">
                <input
                  type="number"
                  required
                  min={1}
                  value={form.currentWeightKg}
                  onChange={(event) =>
                    setForm({ ...form, currentWeightKg: Number(event.target.value) })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Yoshi (oy)">
                <input
                  type="number"
                  min={0}
                  value={form.ageMonths}
                  onChange={(event) =>
                    setForm({ ...form, ageMonths: Number(event.target.value) })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Sarmoya narxi (so'm)"
              hint={
                form.priceUzs > 0 ? `Taxminan ${formatUzsCompact(form.priceUzs)}` : undefined
              }
            >
              <input
                type="number"
                required
                min={1}
                step={50_000}
                value={form.priceUzs}
                onChange={(event) =>
                  setForm({ ...form, priceUzs: Number(event.target.value) })
                }
                className={inputClass}
              />
            </Field>

            <Field
              label={`Investor ulushi — ${form.offeredInvestorSharePercent}%`}
              hint={`Sizga qoladigan ulush: ${farmerShare}%`}
            >
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={form.offeredInvestorSharePercent}
                onChange={(event) =>
                  setForm({
                    ...form,
                    offeredInvestorSharePercent: Number(event.target.value),
                  })
                }
                className="w-full accent-emerald-600"
              />
            </Field>

            <Field label="Rejadagi sotuv sanasi">
              <input
                type="date"
                required
                value={form.expectedSaleDate}
                onChange={(event) =>
                  setForm({ ...form, expectedSaleDate: event.target.value })
                }
                className={inputClass}
              />
            </Field>

            <ModalSubmitButton
              isSubmitting={isSubmitting}
              idleText="E'lonni bozorga chiqarish"
              busyText="Joylashtirilmoqda..."
            />
          </form>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 3. Oylik hisobot
// ============================================================

export interface ReportInput {
  month: string;
  weightKg: number;
  notes: string;
}

export function MonthlyReportModal({
  target,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  /** Hisobot qaysi qo'zi uchun yozilmoqda — null bo'lsa modal yopiq */
  target: Livestock | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: ReportInput) => void;
}) {
  const [form, setForm] = useState<ReportInput>({
    month: currentMonthKey(),
    weightKg: 0,
    notes: "",
  });

  // Har safar boshqa qo'zi tanlanganda formani o'sha qo'zining vazni bilan
  // to'ldiramiz — fermer odatda oldingi vazndan boshlab kiritadi.
  useEffect(() => {
    if (!target) return;
    setForm({
      month: currentMonthKey(),
      weightKg: target.currentWeightKg,
      notes: "",
    });
  }, [target]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  const delta = target ? form.weightKg - target.currentWeightKg : 0;

  return (
    <AnimatePresence>
      {target && (
        <ModalShell
          title="Oylik vazn hisoboti"
          description={`${target.breed ?? "Qo'zi"} uchun. Hisobot investorga darhol ko'rinadi va qo'zining joriy vaznini yangilaydi.`}
          onClose={onClose}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Hisobot oyi">
              <select
                required
                value={form.month}
                onChange={(event) => setForm({ ...form, month: event.target.value })}
                className={inputClass}
              >
                {recentMonthKeys().map((month) => (
                  <option key={month} value={month}>
                    {formatMonthUz(month)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="O'lchangan vazn (kg)"
              hint={
                delta === 0
                  ? `Oldingi o'lchov: ${target.currentWeightKg} kg`
                  : delta > 0
                    ? `Oldingi o'lchovdan ${delta} kg ortiq`
                    : `Oldingi o'lchovdan ${Math.abs(delta)} kg kam`
              }
            >
              <input
                type="number"
                required
                min={1}
                step={0.5}
                value={form.weightKg}
                onChange={(event) =>
                  setForm({ ...form, weightKg: Number(event.target.value) })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Parvarish haqida izoh">
              <textarea
                rows={3}
                required
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Masalan: emlashdan o'tdi, ishtahasi yaxshi, yaylovda boqilmoqda."
                className={inputClass}
              />
            </Field>

            <ModalSubmitButton
              isSubmitting={isSubmitting}
              idleText="Hisobotni yuborish"
              busyText="Yuborilmoqda..."
            />
          </form>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}
