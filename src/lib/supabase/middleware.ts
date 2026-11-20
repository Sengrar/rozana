import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session on every request and returns the response
 * that carries the refreshed cookies, plus the signed-in user's id (or null).
 *
 * Return `response` as it is, or copy its cookies and headers onto any other
 * response you send (see `withSessionCookies`). Otherwise users get signed out.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return { response, userId: null };
  }

  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Server Components read the refreshed session from the request...
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        // ...and the browser gets it from the response.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Cache headers stop a CDN from caching a response with auth cookies.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Keep getClaims() directly after createServerClient. It checks the token
  // signature and refreshes an expired session.
  const { data } = await supabase.auth.getClaims();

  return { response, userId: data?.claims.sub ?? null };
}

/** Copies session cookies and cache headers from `from` onto `to`. */
export function withSessionCookies(to: NextResponse, from: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  for (const key of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(key);
    if (value) to.headers.set(key, value);
  }
  return to;
}
