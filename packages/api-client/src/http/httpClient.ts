import { tokenStore } from "./tokenStore";
import { ApiError } from "../types";

// Next.js "NEXT_PUBLIC_" prefiksli o'zgaruvchilar build vaqtida ham,
// server tomonida ham to'g'ri o'qiladi.
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // true bo'lsa, Authorization header qo'shiladi (standart: true)
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

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store", // marketplace kabi tez o'zgaruvchi ma'lumotlar uchun muhim
  });

  // 204 No Content yoki bo'sh javoblarni xavfsiz qayta ishlash
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) || `So'rov muvaffaqiyatsiz tugadi (${response.status})`;
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  return data as T;
}
