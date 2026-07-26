const TOKEN_KEY = "livestock_invest_token";

/**
 * Bu real Next.js ilovasi (Claude Artifact emas), shuning uchun localStorage
 * ishlatish to'liq xavfsiz va odatiy amaliyot. Server komponentlarida
 * (window mavjud bo'lmagan joyda) bu funksiyalar xavfsiz "no-op" qiladi.
 */
export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};
