import type { Enums } from "@/lib/supabase/database.types";

export type MemberRole = Enums<"member_role">;

export const memberRoles: MemberRole[] = [
  "merchant_admin",
  "merchant_staff",
  "delivery",
  "customer",
];

export function isMemberRole(value: string): value is MemberRole {
  return (memberRoles as string[]).includes(value);
}

/** Hindi + English names for every role, including the platform's own. */
export const roleLabels: Record<
  MemberRole | "super_admin",
  { hi: string; en: string }
> = {
  super_admin: { hi: "सुपर एडमिन", en: "Super admin" },
  merchant_admin: { hi: "दुकान एडमिन", en: "Merchant admin" },
  merchant_staff: { hi: "दुकान स्टाफ़", en: "Merchant staff" },
  delivery: { hi: "डिलीवरी", en: "Delivery" },
  customer: { hi: "ग्राहक", en: "Customer" },
};
