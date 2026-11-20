"use server";

import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export type LoginError = "missing" | "invalid" | "rate_limited" | "unavailable";

export type LoginState = {
  error: LoginError | null;
  email: string;
};

/** Email + password sign-in. Works without JavaScript (plain form post). */
export async function signIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "missing", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.status === 429) return { error: "rate_limited", email };
    if (!error.status || error.status >= 500) {
      return { error: "unavailable", email };
    }
    return { error: "invalid", email };
  }

  // /start sends each person to the right screen for their role.
  redirect(next ?? "/start");
}
