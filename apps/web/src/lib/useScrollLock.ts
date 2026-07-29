"use client";

import { useEffect } from "react";

/**
 * Modal yoki yon panel ochiq turganda orqadagi sahifa scrollini to'xtatadi.
 *
 * Qulf SANOQLI: bir vaqtda bir nechta qatlam ochiq bo'lishi mumkin (masalan,
 * qo'zi paneli ustidan hisobot formasi, uning ustidan tasdiqlash oynasi).
 * Sanoqsiz qilinsa, ustki oyna yopilishi bilan hali ochiq turgan panel ostidagi
 * sahifa yana scroll bo'lib ketardi. Shuning uchun hisob modul darajasida
 * yuritiladi va scroll faqat oxirgi qatlam yopilganda tiklanadi.
 */

let lockCount = 0;
let restoreOverflow = "";
let restorePaddingRight = "";

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const { body } = document;

    if (lockCount === 0) {
      restoreOverflow = body.style.overflow;
      restorePaddingRight = body.style.paddingRight;

      // Scroll o'chirilganda scrollbar yo'qoladi va sahifa eni kengayadi —
      // shu kenglikni padding bilan qoplamasak, kontent bir siltanib qo'yadi.
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPadding =
          Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }

      body.style.overflow = "hidden";
    }

    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.overflow = restoreOverflow;
        body.style.paddingRight = restorePaddingRight;
      }
    };
  }, [isLocked]);
}
