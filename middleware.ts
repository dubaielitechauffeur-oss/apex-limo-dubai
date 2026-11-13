import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth/edge";
import { GEO_COOKIE_NAME } from "./lib/consent";

const intlMiddleware = createMiddleware(routing);

// There is deliberately no crawler special case here. Locale detection is
// off (`localeDetection: false` in i18n/routing.ts), so the URL alone decides
// the locale and intlMiddleware treats bots and visitors identically.
//
// A bot-only branch used to return `NextResponse.next()` for "/" without
// intlMiddleware's internal rewrite to "/en". No route exists at the bare
// root (pages live under app/[locale]), so every crawler — Googlebot,
// Bingbot, ChatGPT, Perplexity and WhatsApp link previews — got a 404 for
// the homepage while browsers got a 200.

/**
 * `app/admin` is a sibling route tree to `app/[locale]`, deliberately
 * outside next-intl's locale prefixing (see ARCHITECTURE.md) — English-only,
 * code-split from the public bundle. Wrapping the whole middleware in
 * Auth.js's `auth()` (edge-safe config — see lib/auth/edge.ts) lets it
 * decode the session cookie for the admin gate below without pulling
 * Prisma/argon2 into the Edge runtime, while every non-admin request falls
 * straight through to the existing next-intl logic, unchanged.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Reachable while signed out — the sign-in gate itself, plus the two
    // account-recovery pages a locked-out admin needs before they can sign
    // in at all.
    const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password"]);
    const isPublicAdminPage = PUBLIC_ADMIN_PATHS.has(pathname);
    const isAuthenticated = !!request.auth?.user;

    if (!isAuthenticated && !isPublicAdminPage) {
      const loginUrl = new URL("/admin/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAuthenticated && isPublicAdminPage) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl.origin));
    }
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // Hand the visitor's country to the browser (see GEO_COOKIE_NAME in
  // lib/consent.ts). Reading the geo header here, instead of with `headers()`
  // inside a Server Component, is what lets public pages be cached: middleware
  // runs on every request even when the page itself comes from the ISR cache.
  // Only rewritten when the value changes, so repeat visits add no header.
  const country = (
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry")
  )?.toUpperCase();
  if (country && /^[A-Z]{2}$/.test(country) && request.cookies.get(GEO_COOKIE_NAME)?.value !== country) {
    response.cookies.set(GEO_COOKIE_NAME, country, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
});

export const config = {
  // Excludes /api/*, Next internals, and anything with a file extension
  // (sitemap.xml, robots.txt, images, favicon, etc.) with no extra config.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
