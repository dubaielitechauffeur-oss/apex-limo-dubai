import type { Metadata } from "next";
import { SITE } from "./constants";
import type { FAQ } from "@/data/faqs";

/**
 * Base metadata applied via the root layout. Individual routes should
 * call `buildMetadata()` to extend/override this per page.
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
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
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
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
    title: `${SITE.name} | ${SITE.tagline}`,
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

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  images?: string[];
}

/** Helper for generating page-level metadata that inherits site defaults. */
export function buildMetadata({
  title,
  description,
  path = "",
  images,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      images: images
        ? images.map((img) => ({ url: img }))
        : defaultMetadata.openGraph?.images,
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
export function organizationJsonLd() {
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
    areaServed: {
      "@type": "City",
      name: "Dubai",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    priceRange: "$$$",
    sameAs: [] as string[],
  };
}

/** FAQPage JSON-LD, built from the site's FAQ data for rich-result eligibility. */
export function faqJsonLd(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
 * including) the current page.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const crumbs: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE.url}${crumb.path}`,
    })),
  };
}
