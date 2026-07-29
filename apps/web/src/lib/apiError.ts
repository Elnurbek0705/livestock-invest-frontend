import { ApiError } from "@livestock-invest/api-client";

/**
 * Xato matnini foydalanuvchiga ko'rsatishga yaroqli holatga keltirish.
 *
 * Muammo shundaki, `httpClient` backend bergan matnni qanday kelsa shunday
 * uzatadi. Backendning o'z matnlari o'zbekcha, lekin NestJS'ning ichki
 * istisnolari inglizcha: masalan `RolesGuard` `false` qaytarganda freymvork
 * `"Forbidden resource"` deb yozadi va o'sha matn interfeysga chiqib qoladi.
 * Bu "interfeysda inglizcha so'z qolmasin" qoidasini buzadi va bitta sahifani
 * tuzatish bilan hal bo'lmaydi — har qanday 401/403/500 shu yo'ldan o'tadi.
 *
 * Shuning uchun tarjima shu yerda, bitta joyda:
 *   1. freymvorkning tanish inglizcha matnlari almashtiriladi;
 *   2. server 5xx bersa matn umuman ishonchsiz — status bo'yicha yoziladi;
 *   3. qolgan hollarda backendning o'z (o'zbekcha) matni o'tkaziladi.
 */

/** NestJS o'zi yozadigan matnlar — ular hech qachon o'zbekcha bo'lmaydi */
const FRAMEWORK_MESSAGES: Record<string, string> = {
  "forbidden resource": "Bu amalni bajarish huquqingiz yo'q.",
  forbidden: "Bu amalni bajarish huquqingiz yo'q.",
  unauthorized: "Sessiya tugagan. Qaytadan kiring.",
  "bad request": "So'rov noto'g'ri yuborildi.",
  "not found": "Ma'lumot topilmadi.",
  "internal server error": "Serverda kutilmagan xatolik yuz berdi.",
  "request timeout": "Server javob bermadi. Qaytadan urinib ko'ring.",
  "payload too large": "Yuborilgan fayl juda katta.",
  "unsupported media type": "Bu turdagi fayl qabul qilinmaydi.",
  "too many requests": "Juda ko'p urinish bo'ldi. Biroz kutib turing.",
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "So'rovda xatolik bor.",
  401: "Sessiya tugagan. Qaytadan kiring.",
  403: "Bu amalni bajarish huquqingiz yo'q.",
  404: "Ma'lumot topilmadi.",
  409: "Bu amal joriy holatda bajarilmaydi.",
  413: "Yuborilgan fayl juda katta.",
  422: "Kiritilgan ma'lumot to'g'ri kelmadi.",
  429: "Juda ko'p urinish bo'ldi. Biroz kutib, qaytadan urinib ko'ring.",
};

const NETWORK_MESSAGE =
  "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring yoki birozdan keyin urinib ko'ring.";

const SERVER_MESSAGE = "Serverda xatolik yuz berdi. Birozdan keyin urinib ko'ring.";

/** `fetch` tarmoq darajasida yiqilganda javob ham, status ham bo'lmaydi */
function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    /fetch|network|failed to fetch/i.test(error.message)
  );
}

export function errorText(error: unknown, fallback: string): string {
  if (isNetworkError(error)) return NETWORK_MESSAGE;
  if (!(error instanceof Error)) return fallback;

  const message = error.message.trim();
  const known = FRAMEWORK_MESSAGES[message.toLowerCase()];
  if (known) return known;

  if (error instanceof ApiError) {
    // 5xx da matn ichki tafsilot bo'lishi mumkin — foydalanuvchiga ko'rsatilmaydi.
    if (error.statusCode >= 500) return SERVER_MESSAGE;
    // Backend o'z matnini bergan bo'lsa u o'zbekcha va aniqroq — o'shani beramiz.
    if (message) return message;
    return STATUS_MESSAGES[error.statusCode] ?? fallback;
  }

  return message || fallback;
}
