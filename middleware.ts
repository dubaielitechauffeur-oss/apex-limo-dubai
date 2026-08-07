import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { auth } from "./lib/auth/edge";

const intlMiddleware = createMiddleware(routing);

// Known crawler user agents are exempted from Accept-Language auto-redirect
// so they always see the unprefixed English URL as the crawl entry point —
// bots send a weak/inconsistent Accept-Language signal, and redirecting them
// risks under-crawling the translated locales rather than helping discover
// them (they're found via hreflang/sitemap instead).
const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot|pinterest|embedly|quora link preview|outbrain|vkshare|w3c_validator|lighthouse|pagespeed/i;

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

  const userAgent = request.headers.get("user-agent") ?? "";
  if (BOT_UA_PATTERN.test(userAgent)) {
    // Skip locale negotiation/redirect entirely for bots — let the request
    // through as-is (the unprefixed default-locale route).
    return NextResponse.next();
  }

  return intlMiddleware(request);
});

export const config = {
  // Excludes /api/*, Next internals, and anything with a file extension
  // (sitemap.xml, robots.txt, images, favicon, etc.) with no extra config.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
