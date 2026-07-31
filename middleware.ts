import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Known crawler user agents are exempted from Accept-Language auto-redirect
// so they always see the unprefixed English URL as the crawl entry point —
// bots send a weak/inconsistent Accept-Language signal, and redirecting them
// risks under-crawling the translated locales rather than helping discover
// them (they're found via hreflang/sitemap instead).
const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot|pinterest|embedly|quora link preview|outbrain|vkshare|w3c_validator|lighthouse|pagespeed/i;

export default function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (BOT_UA_PATTERN.test(userAgent)) {
    // Skip locale negotiation/redirect entirely for bots — let the request
    // through as-is (the unprefixed default-locale route).
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Excludes /api/*, Next internals, and anything with a file extension
  // (sitemap.xml, robots.txt, images, favicon, etc.) with no extra config.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
