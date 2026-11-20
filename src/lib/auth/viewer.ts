import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import type { MemberRole } from "./roles";

export type Membership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantActive: boolean;
  role: MemberRole;
};

/** The signed-in user and every role they hold. */
export type Viewer = {
  userId: string;
  email: string | null;
  isPlatformAdmin: boolean;
  memberships: Membership[];
};

/**
 * Reads the signed-in user's roles from platform_admins and memberships.
 * Returns null when nobody is signed in. Cached for the length of one request,
 * so layouts, pages and actions can all call it.
 *
 * Row-level security still protects the data itself; this decides which
 * screens a person sees.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth) return null;

  const userId = auth.claims.sub;

  const [admin, members] = await Promise.all([
    supabase
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("memberships")
      .select("role, tenant:tenants(id, slug, name, is_active)")
      .eq("user_id", userId)
      .eq("is_active", true),
  ]);

  if (admin.error) {
    throw new Error(`Could not read platform_admins: ${admin.error.message}`);
  }
  if (members.error) {
    throw new Error(`Could not read memberships: ${members.error.message}`);
  }

  const memberships: Membership[] = members.data.flatMap((row) =>
    row.tenant
      ? [
          {
            tenantId: row.tenant.id,
            tenantSlug: row.tenant.slug,
            tenantName: row.tenant.name,
            tenantActive: row.tenant.is_active,
            role: row.role,
          },
        ]
      : [],
  );

  return {
    userId,
    email: auth.claims.email ?? null,
    isPlatformAdmin: admin.data !== null,
    memberships,
  };
});

/** Where a person lands after login when no other page was asked for. */
export function homePathFor(viewer: Viewer) {
  return viewer.isPlatformAdmin ? "/admin" : "/account";
}

/** Signed-in user, or a redirect to the login page that comes back here. */
export async function requireViewer(returnTo: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return viewer;
}

/** Platform admin only. Everyone else goes to their account page. */
export async function requirePlatformAdmin(returnTo = "/admin") {
  const viewer = await requireViewer(returnTo);
  if (!viewer.isPlatformAdmin) redirect("/account?denied=admin");
  return viewer;
}
