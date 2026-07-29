import type { User } from "@livestock-invest/shared-types";

/**
 * Rolga mos keladigan bosh sahifa (kabinet) yo'nalishini qaytaradi.
 * Investor — marketplace (investitsiya qilish uchun),
 * Fermer — o'z kabineti, Vet/Admin — tegishli boshqaruv paneli.
 */
export function getRoleHomePath(role: User["role"]): string {
  switch (role) {
    case "farmer":
      return "/farmer/dashboard";
    case "vet":
      return "/vet/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "investor":
    default:
      return "/marketplace";
  }
}
