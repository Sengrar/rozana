"use server";

import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

/**
 * Signs out on this device only (other phones stay signed in), then shows
 * the login page. A `next` field brings the next person back to that page.
 */
export async function signOut(formData: FormData) {
  const next = safeNextPath(formData.get("next"));

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });

  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
