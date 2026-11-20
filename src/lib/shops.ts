import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/**
 * A shop's public details by its subdomain, through tenant_by_slug, which
 * returns only safe columns of active shops. Null when there is no such shop.
 * Cached for one request, so the page and its title share one lookup.
 */
export const getShopBySlug = cache(async (slug: string) => {
  if (!SLUG_PATTERN.test(slug)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tenant_by_slug", {
    p_slug: slug,
  });
  if (error) throw new Error(`Could not look up shop: ${error.message}`);

  return data[0] ?? null;
});
