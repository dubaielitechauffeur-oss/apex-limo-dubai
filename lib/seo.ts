import type { Metadata } from "next";
import { SITE, PRICE_RANGE, SAME_AS_URLS, SOCIAL_PROFILES } from "./constants";
import { routing, type Locale } from "@/i18n/routing";
import { TESTIMONIALS } from "@/data/testimonials";
import { LOCATIONS } from "@/data/locations";

/** Open Graph locale tags per site locale (BCP-47-ish, underscore form OG expects). */
const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_AE",
  ar: "ar_AE",
  ru: "ru_RU",
  zh: "zh_CN",
  fr: "fr_FR",
  de: "de_DE",
};

/** Prefixes `path` with the locale segment for every locale except the default. */
export function localizedPath(locale: Locale, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

/** Per-locale site-wide metadata defaults, applied via each locale's root layout.
 *  `tagline` is the translated `common.siteTagline` message — resolved by the
 *  caller (a Server Component) since this function itself isn't async. */
export function getDefaultMetadata(locale: Locale, tagline: string = SITE.tagline): Metadata {
  const url = `${SITE.url}${localizedPath(locale, "/")}`;
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} | ${tagline}`,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
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
      title: `${SITE.name} | ${tagline}`,
      description: SITE.description,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE.name} | ${tagline}`,
      description: SITE.description,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
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
}: BuildMetadataOptions): Metadata {
  const url = `${SITE.url}${localizedPath(locale, path)}`;

  // Every locale's URL for this path, plus x-default pointing at the
  // unprefixed (English) URL — the entry point Google's hreflang guidance
  // recommends for visitors whose language doesn't match any listed locale.
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE.url}${localizedPath(l, path)}`])
  );
  languages["x-default"] = `${SITE.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    ...(robots ? { robots } : {}),
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: SITE.name,
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE_MAP[l]),
      images: images
        ? images.map((img) => ({ url: img }))
        : getDefaultMetadata(locale).openGraph?.images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images ?? ["/og-image.jpg"],
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
export function organizationId(): string {
  return `${SITE.url}/#organization`;
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
export function organizationJsonLd(locale: Locale = routing.defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "additionalType": "https://schema.org/LimousineService",
    "@id": organizationId(),
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/images/brand/apex-logo.webp`,
    telephone: SITE.phone,
    email: SITE.email,
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
    ...aggregateRatingFields(),
  };
}

/**
 * aggregateRating + review, built from data/testimonials.ts — real,
 * published customer testimonials already shown on the site, not
 * fabricated figures. reviewCount intentionally matches the number of
 * reviews actually included here (not the site-wide marketing RATING
 * figure's underlying sample, which may include unlisted Google reviews)
 * so the schema never claims more than what it publishes.
 */
function aggregateRatingFields() {
  if (TESTIMONIALS.length === 0) return {};

  const ratingValue = (
    TESTIMONIALS.reduce((sum, review) => sum + review.rating, 0) / TESTIMONIALS.length
  ).toFixed(1);

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: TESTIMONIALS.length,
      bestRating: "5",
      worstRating: "1",
    },
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
}

interface ArticleJsonLdInput {
  locale: Locale;
  title: string;
  description: string;
  image: string;
  publishDate: string;
  path: string;
  authorName?: string;
  authorEmail?: string;
}

/** Article JSON-LD for a blog post with optional author information. */
export function articleJsonLd({ locale, title, description, image, publishDate, path, authorName, authorEmail }: ArticleJsonLdInput) {
  const url = `${SITE.url}${localizedPath(locale, path)}`;
  const author = authorName ? {
    "@type": "Person",
    name: authorName,
    ...(authorEmail && { email: authorEmail }),
  } : {
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE.name,
  };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image.startsWith("http") ? image : `${SITE.url}${image}`,
    datePublished: publishDate,
    dateModified: publishDate,
    mainEntityOfPage: url,
    url,
    inLanguage: locale,
    author,
    publisher: {
      "@type": "Organization",
      "@id": organizationId(),
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
