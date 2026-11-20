import { NextResponse, type NextRequest } from "next/server";

import { appUrl, classifyHost, siteUrl } from "@/lib/hosts";
import { updateSession, withSessionCookies } from "@/lib/supabase/middleware";

// This file is `middleware.ts`, not Next.js 16's `proxy.ts`, on purpose: the
// Cloudflare adapter supports `proxy.ts` only experimentally. See
// docs/DECISIONS.md (D20).

/** Pages that belong to the app (app.<domain>), not to our website. */
const APP_PATHS = ["/login", "/admin", "/account", "/start"];

/** App pages that need a signed-in user. Role checks happen in the pages. */
const SIGNED_IN_PATHS = ["/admin", "/account"];

function startsWithAny(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Serve the not-found page with a 404 status. */
function notFound(request: NextRequest) {
  return NextResponse.rewrite(new URL("/__not_found__", request.url));
}

export async function middleware(request: NextRequest) {
  const host = classifyHost(request.headers.get("host"));
  const { pathname, search } = request.nextUrl;

  // 1. Decisions that depend only on the host name.
  switch (host.kind) {
    case "www":
      return NextResponse.redirect(siteUrl(pathname + search), 308);
    case "reserved":
      return host.name === "admin"
        ? NextResponse.redirect(appUrl("/admin"), 308)
        : notFound(request);
    case "invalid":
      return notFound(request);
    case "site":
      // Old links to /login or /admin on the main domain go to the app.
      if (startsWithAny(pathname, APP_PATHS)) {
        return NextResponse.redirect(appUrl(pathname + search), 308);
      }
      if (startsWithAny(pathname, ["/shop"])) return notFound(request);
      break;
    case "app":
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/start", request.url));
      }
      if (startsWithAny(pathname, ["/shop"])) return notFound(request);
      break;
    case "shop":
    case "single":
      break;
  }

  // 2. Keep the login session fresh (cheap when nobody is logged in).
  const { response, userId } = await updateSession(request);

  // 3. A shop's address shows that shop's storefront.
  if (host.kind === "shop") {
    const target = request.nextUrl.clone();
    target.pathname = `/shop/${host.slug}${pathname === "/" ? "" : pathname}`;
    return withSessionCookies(
      NextResponse.rewrite(target, { request }),
      response,
    );
  }

  // 4. App pages that need someone logged in.
  if (!userId && startsWithAny(pathname, SIGNED_IN_PATHS)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname + search);
    return withSessionCookies(NextResponse.redirect(loginUrl), response);
  }

  return response;
}

export const config = {
  matcher: [
    // Every path except build files and images.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
