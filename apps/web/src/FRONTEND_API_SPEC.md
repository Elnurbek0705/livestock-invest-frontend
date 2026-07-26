# Frontend uchun backend tavsifi

## 1. Umumiy ma'lumot

- Backend: NestJS + TypeORM + PostgreSQL
- Asosiy port: 3001
- Swagger dokumentatsiyasi: http://localhost:3001/api
- CORS: frontenddan http://localhost:3000 ga ruxsat berilgan

## 2. Avtorizatsiya va rollar

### Foydalanuvchi rollari
- investor
- farmer
- vet
- admin

### Avtorizatsiya
- Login natijasida token qaytariladi
- Token `Authorization: Bearer <token>` shaklida jo‘natiladi
- `auth/me` orqali joriy foydalanuvchi ma'lumotlari olinadi

### Register payload
```json
{
  "fullName": "Aziz Karimov",
  "phone": "+998901234567",
  "email": "aziz@example.com",
  "role": "investor",
  "password": "parol12345"
}
```

### Login payload
```json
{
  "phone": "+998901234567",
  "password": "parol12345"
}
```

## 3. API endpointlari

### Auth

| Method | Route | Maqsad | Eslatma |
|---|---|---|---|
| POST | /auth/register | Yangi foydalanuvchi yaratish | investor/farmer uchun |
| POST | /auth/login | Kirish | token qaytaradi |
| GET | /auth/me | Joriy foydalanuvchi ma'lumotlari | JWT kerak |

### Farms

| Method | Route | Maqsad | Eslatma |
|---|---|---|---|
| GET | /farms | Barcha fermalar ro‘yxati | region/status filter bilan |
| GET | /farms/mine | Joriy fermerning fermalari | faqat farmer |
| GET | /farms/:id | Ferma tafsiloti | ochiq |
| POST | /farms | Ferma yaratish | faqat farmer |
| PATCH | /farms/:id | Ferma ma'lumotlarini yangilash | egasi/admin |
| PATCH | /farms/:id/verify | Ferma statusini tasdiqlash/rad etish | admin/vet |

### Livestock

| Method | Route | Maqsad | Eslatma |
|---|---|---|---|
| GET | /livestock | Marketplace qo‘zilar ro‘yxati | status/farmId filter |
| GET | /livestock/mine | Joriy fermerning qo‘zilari | faqat farmer |
| GET | /livestock/:id | Qo‘zi tafsiloti | ochiq |
| GET | /livestock/:id/monthly-reports | Oylik hisobotlar | ochiq |
| GET | /livestock/:id/vet-reports | Veterinariya hisobotlari | ochiq |
| POST | /livestock | Yangi qo‘zi qo‘shish | faqat farmer, tasdiqlangan ferma kerak |
| PATCH | /livestock/:id/status | Qo‘zi holatini yangilash | faqat farmer |
| POST | /livestock/:id/monthly-reports | Oylik hisobot qo‘shish | faqat fermer |
| POST | /livestock/:id/vet-reports | Vet hisobot qo‘shish | faqat vet |

### Investments

| Method | Route | Maqsad | Eslatma |
|---|---|---|---|
| POST | /investments | Investitsiya yaratish | faqat investor |
| GET | /investments/mine | Investorning investitsiyalari | faqat investor |
| GET | /investments/:id | Investitsiya tafsiloti | JWT kerak |
| GET | /investments/:id/transactions | Pul harakatlari | JWT kerak |
| PATCH | /investments/:id/release-to-farmer | Escrow ni fermerga chiqarish | faqat admin |
| PATCH | /investments/:id/complete-sale | Sotuvni yakunlash | faqat admin |
| PATCH | /investments/:id/complete-payout | Foyda taqsimoti | faqat admin |

### Admin

| Method | Route | Maqsad | Eslatma |
|---|---|---|---|
| GET | /admin/dashboard | Admin panel statistikasi | faqat admin |
| GET | /admin/users | Foydalanuvchilar ro‘yxati | faqat admin |
| PATCH | /admin/users/:id/role | Foydalanuvchi rolini o‘zgartirish | faqat admin/super-admin |

## 4. Muhim DTO / request shakllari

### CreateFarmDto
```json
{
  "name": "Yusupov chorvachilik xo'jaligi",
  "region": "Xorazm",
  "district": "Urganch"
}
```

### CreateLivestockDto
```json
{
  "farmId": "uuid",
  "breed": "Qorako'l",
  "currentWeightKg": 18,
  "ageMonths": 4,
  "priceUzs": 2000000,
  "expectedSaleDate": "2026-12-01",
  "offeredInvestorSharePercent": 70,
  "photoUrls": ["https://cdn.example.com/qozi-1.jpg"]
}
```

### CreateInvestmentDto
- `livestockId` talab qilinadi

### UpdateLivestockStatusDto
- `status` talab qilinadi
- ruxsat etilgan qiymatlar: listed, funded, in_care, ready_for_sale, sold, cancelled

### VerifyFarmDto
- `status` talab qilinadi
- ruxsat etilgan qiymatlar: pending, vet_approved, platform_approved, rejected

## 5. Backendda mavjud modellari

### User
```ts
{
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: 'investor' | 'farmer' | 'vet' | 'admin';
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  isSuperAdmin: boolean;
  createdAt: Date;
}
```

### Farm
```ts
{
  id: string;
  ownerUserId: string;
  name: string;
  region: string;
  district: string | null;
  rating: number;
  verificationStatus: 'pending' | 'vet_approved' | 'platform_approved' | 'rejected';
  isPremium: boolean;
  createdAt: Date;
}
```

### Livestock
```ts
{
  id: string;
  farmId: string;
  status: 'listed' | 'funded' | 'in_care' | 'ready_for_sale' | 'sold' | 'cancelled';
  breed: string | null;
  currentWeightKg: number;
  ageMonths: number | null;
  priceUzs: number;
  expectedSaleDate: string;
  offeredInvestorSharePercent: number;
  photoUrls: string[];
  createdAt: Date;
}
```

### Investment
```ts
{
  id: string;
  investorUserId: string;
  livestockId: string;
  amountUzs: number;
  escrowStatus: 'pending' | 'released_to_farmer' | 'sale_completed' | 'payout_completed' | 'refunded';
  contractProfitSharePercent: number;
  saleAmountUzs: number | null;
  platformFeePercent: number | null;
  platformFeeUzs: number | null;
  investorShareUzs: number | null;
  farmerShareUzs: number | null;
  createdAt: Date;
}
```

### Transaction
```ts
{
  id: string;
  investmentId: string;
  type: 'escrow_deposit' | 'farmer_payout' | 'sale_proceeds' | 'profit_distribution' | 'platform_fee' | 'refund';
  amountUzs: number;
  status: 'pending' | 'completed' | 'failed';
  recipientUserId: string | null;
  createdAt: Date;
}
```

### MonthlyReport
```ts
{
  id: string;
  livestockId: string;
  month: string; // YYYY-MM
  weightKg: number;
  notes: string;
  photoUrls: string[];
  createdAt: Date;
}
```

### VetReport
```ts
{
  id: string;
  livestockId: string;
  vetUserId: string;
  weightKg: number;
  healthNotes: string;
  createdAt: Date;
}
```

## 6. Frontend uchun eng muhim workflowlar

### A. Auth flow
1. Register/login ekranlari
2. Token saqlash (localStorage/sessionStorage)
3. `auth/me` bilan foydalanuvchi profili yuklash
4. Role bo‘yicha route himoya

### B. Farmer flow
1. Ferma yaratish
2. Ferma tasdiqlanishini kutish
3. Qo‘zi qo‘shish
4. Oylik/vet hisobotlar qo‘shish
5. Qo‘zi holatini yangilash

### C. Investor flow
1. Marketplace dan qo‘zilarni ko‘rish
2. Investitsiya qilish
3. Investitsiyalar sahifasida holatni kuzatish
4. Pul harakatlari tarixini ko‘rish

### D. Admin flow
1. Kutayotgan fermalarni ko‘rish
2. Farm verify qilish
3. Kutayotgan investitsiyalarni ko‘rish
4. Sotuv va payout bosqichlarini bajarish
5. Foydalanuvchilar rolini boshqarish

## 7. Frontend sahifalari tavsiyalari

### Umumiy
- Login
- Register
- Home/Marketplace
- Profile

### Farmer
- Farmer dashboard
- Farms list/create/edit
- Livestock list/create
- Livestock detail
- Monthly reports
- Vet reports

### Investor
- Marketplace list
- Livestock detail + invest modal
- My investments
- Investment detail + transactions

### Admin
- Admin dashboard
- Pending farms review
- Investment workflow review
- User management

## 8. Frontend uchun muhim hisoblashlar

- Pul miqdorlari `UZS` sifatida ko‘rsatiladi
- Foizlar `0-100` oralig‘ida bo‘ladi
- Ba’zi maydonlar `bigint` bo‘lgani uchun frontendda `Number()` bilan ishlash kerak
- Status bo‘yicha UI holatlari (pending, funded, released_to_farmer, sale_completed, payout_completed) alohida chip/stepper ko‘rinishida bo‘lishi tavsiya etiladi

## 9. Backenddan qiziqarli ma’lumotlar keladi

- `GET /farms` bo‘yicha marketplace ro‘yxat
- `GET /livestock` bo‘yicha investitsiya uchun qo‘zi ro‘yxati
- `GET /investments/mine` investor shaxsiy investitsiyalari
- `GET /admin/dashboard` admin uchun umumiy statistikalar

## 10. Tavsiya

Frontendni qurishda quyidagi eng muhim kontraktlarga e’tibor bering:
- Auth token va role-based access
- Farm/Livestock/Investment state lifecycle
- Ba’zi endpointlar faqat ma’lum rollar uchun ochiq
- Status transitions bo‘yicha stepper UI
