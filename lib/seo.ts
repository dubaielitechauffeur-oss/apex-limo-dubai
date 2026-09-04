import type { Metadata } from "next";
import { SITE, PRICE_RANGE, RATING, SAME_AS_URLS, SOCIAL_PROFILES } from "./constants";
import { routing, type Locale } from "@/i18n/routing";
import { TESTIMONIALS } from "@/data/testimonials";
import { LOCATIONS } from "@/data/locations";
import type { SiteDefaultSeo } from "./public/site-seo";
import type { PublicSeo } from "./public/seo-fields";

/** Open Graph locale tags per site locale (BCP-47-ish, underscore form OG expects). */
const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_AE",
  ar: "ar_AE",
  ru: "ru_RU",
  zh: "zh_CN",
  fr: "fr_FR",
  de: "de_DE",
};

/**
 * Google renders roughly 155-160 characters of a meta description before
 * truncating with an ellipsis. Every page type on this site was shipping past
 * that — 166 to 231 characters — because the templates interpolate a full
 * service/vehicle description into a sentence that already has framing text.
 * The tail was therefore never seen by a searcher, and the call to action
 * usually sat inside the discarded part.
 *
 * Clamping here rather than at each template means no future page can
 * regress, and it works for every locale: the cut lands on a whitespace
 * boundary where one exists (Latin, Cyrillic, Arabic) and falls back to a
 * hard cut where it does not (Chinese, which has no inter-word spaces).
 *
 * A description already within budget is returned untouched — this only ever
 * shortens.
 */
const MAX_DESCRIPTION_LENGTH = 158;

export function clampDescription(text: string, max = MAX_DESCRIPTION_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;

  // Leave room for the ellipsis character itself.
  const budget = max - 1;
  const slice = trimmed.slice(0, budget);
  const lastSpace = slice.lastIndexOf(" ");
  // Only honour a word boundary if it isn't so early that we'd lose most of
  // the sentence (scripts without spaces would otherwise cut at ~0).
  const cut = lastSpace > budget * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[\s,;:.\u060C\u061B-]+$/u, "")}\u2026`;
}

/** Prefixes `path` with the locale segment for every locale except the default. */
export function localizedPath(locale: Locale, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

/**
 * Per-locale site-wide metadata defaults, applied via each locale's root
 * layout. `tagline` is the translated `common.siteTagline` message —
 * resolved by the caller (a Server Component) since this function itself
 * isn't async. `defaultSeo` is the optional admin-configured override from
 * the SEO Manager (`GlobalSettings.defaultSeo`, see
 * `lib/public/site-seo.ts`) — when present, its title/description/OG image
 * and robots directive replace the static copy below; every field it
 * doesn't set keeps its static default.
 */
export function getDefaultMetadata(locale: Locale, tagline: string = SITE.tagline, defaultSeo?: SiteDefaultSeo | null): Metadata {
  const url = `${SITE.url}${localizedPath(locale, "/")}`;
  const title = defaultSeo?.title || `${SITE.name} | ${tagline}`;
  const description = clampDescription(defaultSeo?.description || SITE.description);
  const ogImageUrl = defaultSeo?.ogImageUrl || "/og-image.jpg";
  const indexable = !(defaultSeo?.noIndex ?? false);
  const followable = !(defaultSeo?.noFollow ?? false);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s | ${SITE.name}`,
    },
    description,
    keywords: [
      "chauffeur service Dubai",
      "limo service Dubai",
      "airport transfer Dubai",
      "corporate chauffeur Dubai",
      "VIP transportation Dubai",
      "luxury car service Dubai",
      "wedding car Dubai",
    ],
    authors: [{ name: SITE.name }],
    creator: SITE.name,
    publisher: SITE.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: true,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE_MAP[l]),
      url,
      siteName: SITE.name,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: indexable,
      follow: followable,
      googleBot: {
        index: indexable,
        follow: followable,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

interface BuildMetadataOptions {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  images?: string[];
  /** OpenGraph object type — "website" (default) for every existing page, or
   *  "article" for blog posts, which adds the `publishedTime` OG field. */
  type?: "website" | "article";
  /** ISO date string — only meaningful (and only emitted) when type is "article". */
  publishedTime?: string;
  /** Overrides the site-default indexable robots directive — used for the
   *  not-found metadata branch of dynamic detail routes (fleet/service/
   *  location/blog), which resolves to a real 404 response. */
  robots?: Metadata["robots"];
  /**
   * Per-page overrides from the admin SEO Manager (`<Model>.seo`), resolved to
   * this locale by `lib/public/seo-fields.ts`. Any field the editor filled in
   * wins over the template-generated value passed above; anything left blank
   * keeps the template default, so an untouched SEO tab changes nothing.
   *
   * This is the ONLY place CMS SEO is applied — there is deliberately no
   * second metadata path, so a page cannot end up with a template title and a
   * CMS canonical disagreeing with each other.
   */
  seo?: PublicSeo | null;
  /**
   * Which locales this page genuinely exists in. Defaults to every configured
   * locale (correct for static pages, whose copy is fully translated in
   * `messages/*`). CMS-backed detail routes pass the narrower set that
   * actually has translated content, so hreflang never advertises a locale
   * that would only render an English fallback — see
   * `lib/public/translation-coverage.ts`.
   */
  alternateLocales?: Locale[];
}

/** Helper for generating page-level metadata that inherits site defaults, with
 *  full hreflang/alternate-locale coverage for the requested locale. */
export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  images,
  type = "website",
  publishedTime,
  robots,
  seo,
  alternateLocales,
}: BuildMetadataOptions): Metadata {
  // CMS values win over the template-generated ones, field by field, so an
  // editor can override just the title and keep the generated description.
  const effectiveTitle = seo?.title || title;
  const effectiveDescription = clampDescription(seo?.description || description);
  const selfUrl = `${SITE.url}${localizedPath(locale, path)}`;
  const canonical = seo?.canonical || selfUrl;
  const effectiveImages = seo?.ogImageUrl ? [seo.ogImageUrl] : images;

  // An explicit `robots` argument (the 404 branch of a detail route) always
  // wins; otherwise a CMS noIndex/noFollow tick becomes a real robots
  // directive. When neither applies, the page inherits the site-wide default
  // from the root layout rather than restating it.
  const seoRobots: Metadata["robots"] | undefined =
    seo && (seo.noIndex || seo.noFollow)
      ? {
          index: !seo.noIndex,
          follow: !seo.noFollow,
          googleBot: { index: !seo.noIndex, follow: !seo.noFollow },
        }
      : undefined;
  const effectiveRobots = robots ?? seoRobots;

  // Every locale's URL for this path, plus x-default pointing at the
  // unprefixed (English) URL — the entry point Google's hreflang guidance
  // recommends for visitors whose language doesn't match any listed locale.
  // Narrowed to `alternateLocales` when the caller knows some locales have no
  // real translation for this specific page.
  const hreflangLocales = alternateLocales ?? [...routing.locales];
  const languages: Record<string, string> = Object.fromEntries(
    hreflangLocales.map((l) => [l, `${SITE.url}${localizedPath(l, path)}`])
  );
  // x-default only makes sense when the default locale is genuinely among the
  // published set — which it always is, since English is the required locale.
  if (hreflangLocales.includes(routing.defaultLocale)) {
    languages["x-default"] = `${SITE.url}${path}`;
  }

  return {
    title: effectiveTitle,
    description: effectiveDescription,
    alternates: { canonical, languages },
    ...(effectiveRobots ? { robots: effectiveRobots } : {}),
    openGraph: {
      type,
      title: effectiveTitle,
      description: effectiveDescription,
      url: selfUrl,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: hreflangLocales.filter((l) => l !== locale).map((l) => OG_LOCALE_MAP[l]),
      images: effectiveImages
        ? effectiveImages.map((img) => ({ url: img }))
        : getDefaultMetadata(locale).openGraph?.images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: effectiveTitle,
      description: effectiveDescription,
      images: effectiveImages ?? ["/og-image.jpg"],
    },
  };
}

/** Stable @id for the business entity, so multiple JSON-LD blocks across the
 *  site (e.g. the root LocalBusiness node and the homepage's review ratings)
 *  can reference the same node instead of declaring duplicate entities.
 *  Only nodes describing this exact same business (identical properties)
 *  should ever reuse this @id — a page describing a distinct sub-entity
 *  (e.g. a specific service area) must use its own unique @id instead, or
 *  Google's structured-data parser can't cleanly resolve the graph. */
export function organizationId(locale: Locale = routing.defaultLocale): string {
  // One node per locale. Previously every locale emitted the SAME `@id` while
  // declaring a different `url`, `inLanguage` and description — six
  // contradictory property sets merged onto a single entity, which is exactly
  // the conflict that produced Search Console's "Invalid object type for
  // field 'parent_node'" error on the location pages. Distinct ids let each
  // language resolve as its own clean node; `sameAs`/`url` still tie them to
  // one business.
  return `${SITE.url}${localizedPath(locale, "/")}#organization`;
}

/**
 * LocalBusiness JSON-LD for the organization. Uses "LocalBusiness" as the
 * primary @type (rather than the more specific "LimousineService") because
 * Google's Review Snippet rich result only accepts self-published
 * aggregateRating/review data when the parent entity is LocalBusiness or a
 * supported subtype — LimousineService sits under schema.org's Service
 * branch, not LocalBusiness, which is what previously caused Search
 * Console's "Invalid object type for field 'parent_node'" error. The more
 * specific categorization is preserved via `additionalType` instead of
 * being removed.
 */
export function organizationJsonLd(
  locale: Locale = routing.defaultLocale,
  contact?: { phone: string; email: string },
  { includeReviews = false }: { includeReviews?: boolean } = {}
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "additionalType": "https://schema.org/LimousineService",
    "@id": organizationId(locale),
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/images/brand/apex-logo.webp`,
    telephone: contact?.phone ?? SITE.phone,
    email: contact?.email ?? SITE.email,
    inLanguage: locale,
    // Service-area business: coverage is declared through areaServed rather
    // than a storefront address. Dubai city + the wider UAE is the honest
    // top-level claim; the per-district entries are derived from
    // data/locations.ts so adding a new location page automatically extends
    // this list instead of silently leaving it stale.
    areaServed: [
      { "@type": "City", name: "Dubai" },
      { "@type": "Country", name: "United Arab Emirates" },
      ...LOCATIONS.map((location) => ({
        "@type": "Place" as const,
        name: location.name,
        ...(location.geo
          ? {
              geo: {
                "@type": "GeoCoordinates" as const,
                latitude: location.geo.latitude,
                longitude: location.geo.longitude,
              },
            }
          : {}),
      })),
    ],
    // ⚠️ Intentionally NO `streetAddress`/`postalCode`. Apex is a
    // service-area business (SAB) — chauffeurs travel to the client, and no
    // customers are served at a physical office. Google's own guidance is
    // that an SAB must hide its address (both in Google Business Profile and
    // in structured data); publishing a street address here would contradict
    // the GBP listing and risks a mismatch/suspension. City + country is the
    // correct, complete shape for this business model — do not "fix" this by
    // adding an address.
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    // Chauffeur service operates 24/7; the office/support line keeps
    // separate hours — both reflect the real hours quoted in
    // messages/*/contact.json (sidebar.chauffeurService / supportHours),
    // not a placeholder.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    priceRange: PRICE_RANGE,
    // Owner-verified public profiles — see SOCIAL_PROFILES in
    // lib/constants.ts. These are what let Google reconcile this site with
    // the Google Business Profile listing as one entity rather than two.
    sameAs: SAME_AS_URLS,
    hasMap: SOCIAL_PROFILES.googleBusiness,
    // Reviews are intentionally scoped out of the site-wide node — see the
    // `includeReviews` note above and `organizationReviewsJsonLd`.
    ...(includeReviews ? aggregateRatingFields() : {}),
  };
}

/**
 * aggregateRating + review as a standalone node reusing the organization's
 * `@id`, so Google merges these reviews onto the single business entity.
 * Emitted only on the homepage (the page that renders the matching
 * testimonial cards), keeping self-published review markup off pages that
 * don't display those reviews — legal pages, 404s, deep detail pages, etc.
 * Returns null when there are no testimonials to publish.
 */
export function organizationReviewsJsonLd(locale: Locale = routing.defaultLocale) {
  const fields = aggregateRatingFields();
  if (Object.keys(fields).length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "additionalType": "https://schema.org/LimousineService",
    "@id": organizationId(locale),
    inLanguage: locale,
    ...fields,
  };
}

/**
 * aggregateRating + review, built from data/testimonials.ts.
 *
 * Two rules govern what may be published here, and they used to conflict:
 *
 * 1. Google requires the marked-up rating to MATCH what the visitor sees.
 *    Every rating on this site renders `RATING` (lib/constants.ts) — the
 *    business's stated aggregate, also written into the About and metadata
 *    copy in all six locales. This function previously ignored that and
 *    published the mean of the listed testimonials instead, so the schema
 *    said 5.0 while every visible star row said 4.9.
 *
 * 2. Nothing here may be invented. `reviewCount` is the number of reviews
 *    this markup actually publishes — never a larger implied sample.
 *
 * The guard below enforces both: if the published testimonials cannot
 * substantiate the stated figure (they differ by more than half a star), the
 * aggregate is OMITTED rather than published as a claim the page cannot back
 * up. Individual `review` nodes are still emitted either way, since those are
 * verbatim and verifiable.
 *
 * To raise `reviewCount` honestly, sync real Google Business Profile reviews
 * into `TESTIMONIALS` — the Testimonial shape already carries `source:
 * "google"` and `profileUrl` for exactly that.
 */
const MAX_RATING_DIVERGENCE = 0.5;

function aggregateRatingFields() {
  if (TESTIMONIALS.length === 0) return {};

  const publishedMean =
    TESTIMONIALS.reduce((sum, review) => sum + review.rating, 0) / TESTIMONIALS.length;
  const statedRating = parseFloat(RATING);

  const reviews = {
    review: TESTIMONIALS.map((testimonial) => ({
      "@type": "Review",
      author: { "@type": "Person", name: testimonial.name },
      datePublished: testimonial.date,
      reviewBody: testimonial.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: testimonial.rating,
        bestRating: "5",
        worstRating: "1",
      },
    })),
  };

  if (!Number.isFinite(statedRating) || Math.abs(publishedMean - statedRating) > MAX_RATING_DIVERGENCE) {
    return reviews;
  }

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      // The figure the page itself displays — see rule 1 above.
      ratingValue: RATING,
      reviewCount: TESTIMONIALS.length,
      bestRating: "5",
      worstRating: "1",
    },
    ...reviews,
  };
}

/**
 * WebSite node — previously absent entirely, so nothing in the graph declared
 * the site's own name or its search endpoint. Gives Google an explicit
 * site-name signal (rather than inferring one from the title tag) and makes
 * the site eligible for the sitelinks search box.
 *
 * `potentialAction` points at the FAQ hub's client-side search, which is the
 * only real site search that exists — pointing it anywhere else would declare
 * a capability the site does not have.
 */
export function websiteJsonLd(locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}${localizedPath(locale, "/")}#website`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: `${SITE.url}${localizedPath(locale, "/")}`,
    inLanguage: locale,
    publisher: { "@id": organizationId(locale) },
  };
}

interface ArticleJsonLdInput {
  locale: Locale;
  title: string;
  description: string;
  image: string;
  publishDate: string;
  /** ISO timestamp of the last edit. Falls back to publishDate when unknown. */
  modifiedDate?: string;
  path: string;
  authorName?: string;
}

/** Article JSON-LD for a blog post with optional author information. */
export function articleJsonLd({ locale, title, description, image, publishDate, modifiedDate, path, authorName }: ArticleJsonLdInput) {
  const url = `${SITE.url}${localizedPath(locale, path)}`;
  // Author email is deliberately NOT published.
  //
  // `email` is not a recommended property of `Article.author` and adds nothing
  // for search or answer engines, while publishing an address in
  // machine-readable markup is a standing invitation to harvesters. The
  // addresses previously emitted here also sat on a domain the business does
  // not own (apexlimo.com, vs apexchauffeurdubai.com), which actively worked
  // against the entity consolidation that AI search depends on — a second
  // domain in the author graph reads as a different organisation.
  //
  // `url` links the author to the business entity instead, which is the
  // relationship Google actually uses.
  const author = authorName
    ? {
        "@type": "Person",
        name: authorName,
        worksFor: { "@id": organizationId(locale) },
      }
    : {
        "@type": "Organization",
        "@id": organizationId(locale),
        name: SITE.name,
      };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image.startsWith("http") ? image : `${SITE.url}${image}`,
    datePublished: publishDate,
    // Real last-edit timestamp when the CMS has one. This was hardcoded to
    // `publishDate`, so every post claimed it had never been updated —
    // freshness is a ranking and AI-citation input, and the `updatedAt`
    // column already existed.
    dateModified: modifiedDate ?? publishDate,
    mainEntityOfPage: url,
    url,
    inLanguage: locale,
    author,
    publisher: {
      "@type": "Organization",
      "@id": organizationId(locale),
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/images/brand/apex-logo.webp`,
      },
    },
  };
}

interface PlainFaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage JSON-LD, built from the site's FAQ data for rich-result
 * eligibility. Takes already-locale-resolved plain strings — callers
 * pull from whichever data source (fleet/services/locations/faqHub/etc.)
 * and resolve to the current locale before passing them in here, so this
 * function stays decoupled from any one data file's schema.
 */
export function faqJsonLd(faqs: PlainFaqEntry[], locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

interface BreadcrumbItem {
  name: string;
  /** Path relative to the site root, e.g. "/fleet" or "/fleet/rolls-royce-phantom". */
  path: string;
}

/**
 * BreadcrumbList JSON-LD for a page's position in the site hierarchy.
 * Always starts from Home — pass the remaining crumbs down to (and
 * including) the current page. `homeLabel` defaults to English; pages pass
 * a translated label once nav copy is localized in a later phase.
 */
export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
  locale: Locale = routing.defaultLocale,
  homeLabel = "Home"
) {
  const crumbs: BreadcrumbItem[] = [{ name: homeLabel, path: "/" }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: locale,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE.url}${localizedPath(locale, crumb.path)}`,
    })),
  };
}
