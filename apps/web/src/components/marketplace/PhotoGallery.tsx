"use client";

/**
 * Qo'zi suratlari — bitta katta surat va uning ostida kichik tanlagichlar.
 *
 * Surat bo'lmasa ham konteyner joyida qoladi (`ListingPhoto` placeholder
 * chiqaradi), shunda sahifa tuzilishi e'londan e'longa o'zgarib ketmaydi.
 */

import { useState } from "react";
import { ListingPhoto } from "./ListingPhoto";

export function PhotoGallery({ photoUrls, alt }: { photoUrls: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-2">
      <div className="aspect-16/10 w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
        <ListingPhoto url={photoUrls[active] ?? null} alt={alt} />
      </div>

      {photoUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photoUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${index + 1}-surat`}
              aria-current={index === active}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                index === active
                  ? "border-emerald-600"
                  : "border-transparent hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              <ListingPhoto url={url} alt={`${alt} — ${index + 1}-surat`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
