import type { ReactNode } from "react";

/**
 * Bosh sahifa bo'limlarining yagona sarlavha shakli.
 *
 * Ilgari har bir bo'lim o'zining bezak nishoni, katta sarlavhasi va uzun
 * kirish paragrafi bilan boshlanardi — natijada sahifaning yarmi tushuntirish
 * matni edi. Endi shakl bitta: sarlavha va ko'pi bilan bitta qator izoh.
 */
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Bo'limlar orasidagi bir xil masofa va ajratgich chiziq */
export const sectionClass =
  "scroll-mt-24 border-t border-stone-200 py-12 dark:border-stone-800";
