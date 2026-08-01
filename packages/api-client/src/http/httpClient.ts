import { tokenStore } from "./tokenStore";
import { ApiError } from "../types";

// Next.js "NEXT_PUBLIC_" prefiksli o'zgaruvchilar build vaqtida ham,
// server tomonida ham to'g'ri o'qiladi.
//
// Oxirgi slash olib tashlanadi. Xosting panellarida manzil ko'pincha
// `https://api.example.com/` ko'rinishida nusxalanadi, yo'llar esa `/` bilan
// boshlanadi — natijada `https://api.example.com//auth/register` hosil
// bo'lardi va server 404 qaytarardi. Xatoning sababi brauzer konsolida
// deyarli ko'rinmaydi, shuning uchun uni shu yerda oldini olamiz.
function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  return raw.replace(/\/+$/, "");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // true bo'lsa, Authorization header qo'shiladi (standart: true)
}

/**
 * Hozir bajarilayotgan so'rovlar soni.
 *
 * Interfeysdagi yuklash chizig'i shu yerdan oziqlanadi. Kuzatuv aynan shu
 * joyda, chunki barcha so'rovlar `apiRequest` dan o'tadi — har bir sahifaga
 * alohida "yuklanmoqda" holatini ulashning hojati yo'q.
 *
 * Kabinetlar ma'lumotni klient tomonda yuklaydi, ya'ni sahifa almashishi
 * emas, aynan shu so'rovlar sekin bo'ladigan qism.
 */
let pendingCount = 0;
const pendingListeners = new Set<(count: number) => void>();

function setPending(next: number) {
  pendingCount = next;
  for (const listener of pendingListeners) listener(pendingCount);
}

export function getPendingRequestCount(): number {
  return pendingCount;
}

/** Obunani bekor qiluvchi funksiyani qaytaradi */
export function onPendingRequestsChange(
  listener: (count: number) => void,
): () => void {
  pendingListeners.add(listener);
  return () => {
    pendingListeners.delete(listener);
  };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = tokenStore.get();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  setPending(pendingCount + 1);
  let response: Response;
  let text: string;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store", // marketplace kabi tez o'zgaruvchi ma'lumotlar uchun muhim
    });
    // 204 No Content yoki bo'sh javoblarni xavfsiz qayta ishlash
    text = await response.text();
  } finally {
    // Tarmoq xatosida ham hisoblagich kamayishi shart, aks holda yuklash
    // chizig'i abadiy qolib ketadi.
    setPending(Math.max(0, pendingCount - 1));
  }

  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) || `So'rov muvaffaqiyatsiz tugadi (${response.status})`;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return data as T;
}
