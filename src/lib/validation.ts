import { message, type Message } from "@/lib/form-state";

// Same rules as the tenants.slug check constraint in 0001_foundation.sql.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
export const RESERVED_SLUGS = ["www", "app", "admin", "api", "store", "help"];

/** Returns what is wrong with a shop subdomain, or null if it is fine. */
export function checkSlug(slug: string): Message | null {
  if (!slug) {
    return message("सबडोमेन भरें।", "Enter a subdomain.");
  }
  if (!SLUG_PATTERN.test(slug)) {
    return message(
      "सबडोमेन में सिर्फ़ a-z, 0-9 और बीच में - हो, 3 से 32 अक्षर।",
      "Use only a-z, 0-9 and - (not at the start or end), 3 to 32 characters.",
    );
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return message(
      "यह नाम रिज़र्व है, कोई और चुनें।",
      "This name is reserved. Choose another.",
    );
  }
  return null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
