# Livestock Invest — Monorepo

## Talablar
- Node.js 20+ (tavsiya: 22)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Backend ishga tushirilgan bo'lishi kerak (`livestock-invest-backend`,
  odatda `http://localhost:3001`)

## O'rnatish

```bash
pnpm install
```

## Backend bilan bog'lash

`apps/web/.env.local.example` faylini `apps/web/.env.local` deb nusxalang:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Standart holatda bu `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` va
`NEXT_PUBLIC_USE_MOCK_API=false` ni o'rnatadi — ya'ni frontend endi
**haqiqiy backend'ga** ulanadi.

Agar backend hali ishga tushmagan bo'lsa yoki frontend ustida backend'siz
ishlashni xohlasangiz, `.env.local`da:
```
NEXT_PUBLIC_USE_MOCK_API=true
```
qiling — bu holda frontend xotiradagi mock ma'lumotlar bilan ishlaydi,
kodning boshqa hech qanday qismini o'zgartirish shart emas.

## Ishga tushirish (dev server)

```bash
pnpm dev:web
```

Brauzerda oching:
- http://localhost:3000 — bosh sahifa
- http://localhost:3000/register — ro'yxatdan o'tish
- http://localhost:3000/login — kirish
- http://localhost:3000/marketplace — qo'zilar ro'yxati (backend'dan)
- http://localhost:3000/marketplace/[id] — qo'zi tafsiloti + investitsiya qilish
- http://localhost:3000/investments/mine — o'z investitsiyalarim (investor, login talab qiladi)

## Tuzilma

```
apps/
  web/                  ← Next.js (App Router, TypeScript, Tailwind)
    src/app/login/               ← Login sahifasi
    src/app/register/            ← Ro'yxatdan o'tish sahifasi
    src/app/marketplace/         ← Qo'zilar ro'yxati (backend'dan, real vaqtda)
    src/app/marketplace/[id]/    ← Qo'zi tafsiloti + "Investitsiya qilish" tugmasi
    src/app/investments/mine/    ← Investorning o'z investitsiyalari
    src/lib/authStore.ts         ← Zustand auth holati (login/register/logout)
packages/
  shared-types/         ← Umumiy TypeScript tiplari — ENDI BACKEND'GA ANIQ MOS
  validation/           ← Zod validatsiya sxemalari (register, login, farm, livestock)
  api-client/           ← LivestockInvestApi interfeysi + http (real) va mock implementatsiyalar
```

## Muhim: endi HAQIQIY backend bilan ishlaydi

`packages/api-client/src/index.ts`dagi `getApiClient()` endi standart holatda
`httpApi`ni (haqiqiy `fetch` chaqiruvlari bilan, `packages/api-client/src/http/`)
qaytaradi. `mockApi` hali ham mavjud — `NEXT_PUBLIC_USE_MOCK_API=true` bilan
faollashtiriladi (masalan backend'siz UI ustida ishlashda foydali).

### `bigint` xavfsizligi

Backend'dagi PostgreSQL `bigint` ustunlari (`priceUzs`, `amountUzs` va h.k.)
ba'zan JSON orqali **string** sifatida kelishi mumkin. `packages/api-client/src/http/mappers.ts`
faylida bu avtomatik `Number()`ga o'tkazib olinadi — frontendning qolgan
qismi doim haqiqiy `number` tipi bilan ishlaydi, bu haqda qayg'urish shart
emas.

## Typecheck

```bash
pnpm -r typecheck
```

## Muammolar bo'lsa

- Agar `pnpm install` paytida "sharp" haqida ogohlantirish chiqsa — bu Next.js'ning
  rasm optimizatsiya kutubxonasi, ixtiyoriy. `.npmrc` da `ignore-scripts=true`
  o'rnatilgan, shuning uchun avtomatik e'tiborsiz qoldiriladi.
- Marketplace sahifasida "Ma'lumotlarni yuklab bo'lmadi" degan xato chiqsa —
  backend serveringiz (`pnpm start:dev`, odatda port 3001) ishlab
  turganiga va `.env.local`dagi `NEXT_PUBLIC_API_BASE_URL` to'g'ri portga
  ko'rsatib turganiga ishonch hosil qiling.
- Login/Register ishlamasa — brauzer konsolida (F12) CORS xatosi chiqishi
  mumkin. Bu holatda backend'dagi `main.ts` faylida `app.enableCors()`
  qo'shilganiga ishonch hosil qiling (agar hali qo'shilmagan bo'lsa, xabar
  bering — buni ham tuzatib beraman).
