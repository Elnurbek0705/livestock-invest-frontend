"use client";

/**
 * Ko'rinish sozlamalari: mavzu (yorug'/qorong'i) va shrift o'lchami.
 *
 * Ikkalasi ham <html> elementiga yoziladi — mavzu `data-theme` atributiga,
 * o'lcham esa `--font-scale` o'zgaruvchisiga. Shu sababli butun interfeys
 * bitta joydan boshqariladi va komponentlarga hech narsa uzatilmaydi.
 *
 * Boshlang'ich qiymatni layout'dagi kichik skript sahifa chizilishidan oldin
 * qo'yadi (`THEME_INIT_SCRIPT`), aks holda sahifa avval oq, keyin qorong'i
 * bo'lib chaqnab ketardi. Bu provayder faqat o'sha qiymatni o'qib oladi va
 * keyingi o'zgarishlarni boshqaradi.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";

export const FONT_SCALES = [
  { value: 0.9, label: "Kichik" },
  { value: 1, label: "Odatiy" },
  { value: 1.125, label: "Katta" },
  { value: 1.25, label: "Juda katta" },
] as const;

const THEME_KEY = "li-theme";
const SCALE_KEY = "li-font-scale";
const MIN_SCALE = FONT_SCALES[0].value;
const MAX_SCALE = FONT_SCALES[FONT_SCALES.length - 1].value;

/**
 * Sahifa chizilishidan oldin ishlaydigan skript. Bu yerda saqlanadi, chunki
 * kalitlar va chegaralar provayder bilan bir xil bo'lishi shart.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var d=document.documentElement;
var p=localStorage.getItem(${JSON.stringify(THEME_KEY)})||"system";
if(p!=="light"&&p!=="dark"&&p!=="system")p="system";
var t=p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;
d.dataset.theme=t;d.dataset.themePref=p;d.style.colorScheme=t;
var s=parseFloat(localStorage.getItem(${JSON.stringify(SCALE_KEY)}));
if(s>=${MIN_SCALE}&&s<=${MAX_SCALE})d.style.setProperty("--font-scale",String(s));
}catch(e){}})();`;

interface AppearanceValue {
  /** Foydalanuvchi tanlovi — "system" ham bo'lishi mumkin */
  preference: ThemePreference;
  /** Amalda qo'llangan mavzu */
  resolved: "light" | "dark";
  fontScale: number;
  setPreference: (preference: ThemePreference) => void;
  setFontScale: (scale: number) => void;
}

const AppearanceContext = createContext<AppearanceValue | null>(null);

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server'da <html> atributlari yo'q, shuning uchun boshlang'ich qiymat
  // neytral; haqiqiysi birinchi effektda skript qoldirgan atributdan olinadi.
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [fontScale, setFontScaleState] = useState(1);

  useEffect(() => {
    const root = document.documentElement;
    const stored = root.dataset.themePref;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setPreferenceState(stored);
    }
    if (root.dataset.theme === "dark" || root.dataset.theme === "light") {
      setResolved(root.dataset.theme);
    }
    const scale = parseFloat(
      getComputedStyle(root).getPropertyValue("--font-scale"),
    );
    if (Number.isFinite(scale) && scale > 0) setFontScaleState(scale);
  }, []);

  const apply = useCallback((next: ThemePreference) => {
    const root = document.documentElement;
    const theme = next === "system" ? systemTheme() : next;
    root.dataset.theme = theme;
    root.dataset.themePref = next;
    root.style.colorScheme = theme;
    setResolved(theme);
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Saqlash imkoni bo'lmasa (maxfiy rejim) — tanlov shu sessiyada ishlaydi.
      }
      apply(next);
    },
    [apply],
  );

  const setFontScale = useCallback((scale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    setFontScaleState(clamped);
    document.documentElement.style.setProperty("--font-scale", String(clamped));
    try {
      localStorage.setItem(SCALE_KEY, String(clamped));
    } catch {
      // yuqoridagi kabi
    }
  }, []);

  // "Tizim bo'yicha" tanlanganda OS sozlamasi o'zgarsa darhol ergashamiz.
  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference, apply]);

  const value = useMemo(
    () => ({ preference, resolved, fontScale, setPreference, setFontScale }),
    [preference, resolved, fontScale, setPreference, setFontScale],
  );

  return (
    <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance faqat ThemeProvider ichida ishlatiladi");
  }
  return context;
}
