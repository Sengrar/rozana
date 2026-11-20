import type { Message } from "@/lib/form-state";
import type { Enums } from "@/lib/supabase/database.types";

export type SubscriptionStatus = Enums<"subscription_status">;

export const subscriptionStatuses: SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "paused",
  "cancelled",
];

export function isSubscriptionStatus(
  value: string,
): value is SubscriptionStatus {
  return (subscriptionStatuses as string[]).includes(value);
}

export const statusLabels: Record<SubscriptionStatus, Message> = {
  trialing: { hi: "ट्रायल", en: "Trial" },
  active: { hi: "चालू", en: "Active" },
  past_due: { hi: "भुगतान बाकी", en: "Payment due" },
  paused: { hi: "रुका हुआ", en: "Paused" },
  cancelled: { hi: "बंद", en: "Cancelled" },
};

/** Text colour for each status. */
export const statusTone: Record<SubscriptionStatus, string> = {
  trialing: "text-action",
  active: "text-ok",
  past_due: "text-margin",
  paused: "text-ink-muted",
  cancelled: "text-ink-muted",
};
