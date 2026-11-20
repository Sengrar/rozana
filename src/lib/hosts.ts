import { RESERVED_SLUGS } from "@/lib/validation";

/**
 * Which part of the platform a request is for, decided by its host name
 * (D28). With NEXT_PUBLIC_ROOT_DOMAIN = "example.in":
 *
 *   example.in          "site"  our own website
 *   www.example.in      "www"   redirects to example.in
 *   app.example.in      "app"   login, super admin, shop-owner screens
 *   <shop>.example.in   "shop"  that shop's storefront
 *
 * When NEXT_PUBLIC_ROOT_DOMAIN is empty or "none", or the host is not under
 * it (for example a workers.dev address or a LAN address), the host is
 * "single": everything is served on that one address and shops live at
 * /shop/<slug>.
 *
 * Pure string work only: this file also runs in the edge middleware.
 */
export type HostKind =
  | { kind: "site" }
  | { kind: "www" }
  | { kind: "app" }
  | { kind: "shop"; slug: string }
  | { kind: "reserved"; name: string }
  | { kind: "invalid" }
  | { kind: "single" };

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/** "example.in", "localhost:3000", or null for one-address mode. */
export function getRootDomain(): string | null {
  const value = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
  // "none" exists because Windows cannot reliably pass an empty value
  // through to the build (scripts/cloudflare.mjs uses it).
  return value && value !== "none" ? value : null;
}

export function classifyHost(
  rawHost: string | null,
  root: string | null = getRootDomain(),
): HostKind {
  const host = (rawHost ?? "").trim().toLowerCase();
  if (!root || !host) return { kind: "single" };
  if (host === root) return { kind: "site" };
  if (!host.endsWith(`.${root}`)) return { kind: "single" };

  const sub = host.slice(0, -(root.length + 1));
  if (sub === "www") return { kind: "www" };
  if (sub === "app") return { kind: "app" };
  if (sub.includes(".") || !SLUG_PATTERN.test(sub)) return { kind: "invalid" };
  if (RESERVED_SLUGS.includes(sub)) return { kind: "reserved", name: sub };
  return { kind: "shop", slug: sub };
}

/** Local addresses use http; real domains use https. */
function protocolFor(root: string) {
  const hostname = root.split(":")[0];
  const isLocal =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.endsWith(".nip.io");
  return isLocal ? "http:" : "https:";
}

function absolute(sub: string | null, path: string) {
  const root = getRootDomain();
  if (!root) return null;
  const host = sub ? `${sub}.${root}` : root;
  return `${protocolFor(root)}//${host}${path}`;
}

/** A page on our own website (the main domain). */
export function siteUrl(path = "/") {
  return absolute(null, path) ?? path;
}

/** A page in the app (app.<domain>). */
export function appUrl(path = "/") {
  return absolute("app", path) ?? path;
}

/** A page of a shop's storefront (<shop>.<domain>). */
export function shopUrl(slug: string, path = "/") {
  return absolute(slug, path) ?? `/shop/${slug}${path === "/" ? "" : path}`;
}
