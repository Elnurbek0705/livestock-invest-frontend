"use client";

/**
 * Navbar ustidagi yupqa yuklash chizig'i.
 *
 * Ikki manbadan oziqlanadi:
 *   1. API so'rovlari (`onPendingRequestsChange`) — kabinetlar ma'lumotni
 *      klient tomonda yuklaydi, sekin bo'ladigan qism aynan shu;
 *   2. sahifa almashishi — bozor va bosh sahifa server komponenti, ular
 *      ma'lumotni serverda oladi, ya'ni o'tish ham kutish bo'lishi mumkin.
 *
 * Chiziq oxirigacha yetmaydi, 90% da to'xtaydi: qancha kutish qolganini
 * bilmaymiz, soxta aniqlik ko'rsatishdan ko'ra to'xtab turgani halolroq.
 * Tugagach 100% ga sakraydi va so'niydi.
 *
 * Nega Next'ning `useLinkStatus` i emas: u "must be used within a descendant
 * component of a `Link`" (Next 16 hujjati), ya'ni har bir havolaning ichida
 * yashashi kerak. Bizga esa navbar ustida turadigan bitta global chiziq
 * kerak, qolaversa u 1-manbani — API so'rovlarini — umuman ko'rmaydi.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { onPendingRequestsChange } from "@livestock-invest/api-client";

export function TopProgressBar() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Manba 1: API so'rovlari ---
  useEffect(() => onPendingRequestsChange((count) => setIsActive(count > 0)), []);

  // --- Manba 2: sahifa almashishi ---
  // Ichki havolaga bosilganda boshlanadi, `pathname` o'zgarganda tugaydi.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank") return;
      // Faqat ichki, sahifa almashtiradigan havolalar
      if (!href.startsWith("/") || href.startsWith("/#")) return;
      if (href.split("#")[0] === pathname) return;

      setIsActive(true);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  // Yangi sahifa ochilgach navigatsiya tugadi.
  useEffect(() => {
    setIsActive(false);
  }, [pathname]);

  // --- Ko'rsatkichning harakati ---
  useEffect(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (!isActive) {
      if (progress === 0) return;
      setProgress(100);
      hideTimer.current = setTimeout(() => setProgress(0), 250);
      return;
    }

    setProgress((current) => (current === 0 ? 12 : current));
    // Sekinlashib boruvchi qadam: boshida tez, 90% ga yaqinlashganda deyarli
    // to'xtaydi — kutish uzayganda chiziq oxiriga urilib qolmasligi uchun.
    const tick = setInterval(() => {
      setProgress((current) => (current >= 90 ? current : current + (90 - current) * 0.12));
    }, 200);

    return () => clearInterval(tick);
    // `progress` ataylab bog'liqlikda emas: u har tikda o'zgaradi va effektni
    // qayta ishga tushirib, intervalni cheksiz qayta yaratardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (progress === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden"
    >
      <div
        className="h-full bg-emerald-500 transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
