import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/**
 * Crawl policy.
 *
 * AI crawlers are ALLOWED, deliberately — GPTBot, ClaudeBot, PerplexityBot,
 * OAI-SearchBot and Google-Extended all fall under the wildcard rule below.
 * For a local service business that is the right trade: OAI-SearchBot and
 * PerplexityBot drive live cited answers with real click-through, and
 * Google-Extended governs AI Overview eligibility without touching classic
 * Search rank. Blocking the training crawlers would also cost presence in the
 * retrieval-augmented answers, because they share infrastructure — and a
 * chauffeur company's service copy has no licensing value to protect.
 *
 * This is recorded as an explicit decision rather than an inherited default.
 * Revisit it only if the site starts publishing proprietary data or original
 * photography it intends to license.
 *
 * `/admin` is disallowed here, but robots.txt only prevents CRAWLING, not
 * indexing of a URL discovered elsewhere — the real protection is the
 * middleware auth gate plus the `noindex` sent by the admin layout.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
