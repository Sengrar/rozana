/**
 * Accepts only a path inside this site ("/admin", "/account?x=1"), so a
 * `next=` link can never send someone to another website after login.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value === "/login" || value.startsWith("/login?")) return null;
  return value;
}
