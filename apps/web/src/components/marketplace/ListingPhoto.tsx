"use client";

/**
 * Qo'zi surati.
 *
 * Atayin `next/image` emas, oddiy `<img>`: suratlar ixtiyoriy tashqi manzillardan
 * keladi (fermer kiritadi), `next/image` esa har bir hostni `next.config.ts`
 * dagi `images.remotePatterns` ro'yxatiga yozishni talab qiladi — bu yerda
 * bunday ro'yxatni oldindan tuzib bo'lmaydi.
 *
 * O'lchamning sakrab ketmasligi uchun tashqi konteyner har doim `aspect-*`
 * bilan beriladi, surat esa uni to'liq qoplaydi.
 */

import { useState } from "react";
import { Sprout } from "lucide-react";

export function ListingPhoto({
  url,
  alt,
  className = "",
}: {
  url: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-stone-100 dark:bg-stone-800 ${className}`}
        role="img"
        aria-label={`${alt} — surat qo'shilmagan`}
      >
        <Sprout className="h-1/4 w-1/4 max-h-10 max-w-10 text-stone-300 dark:text-stone-600" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
