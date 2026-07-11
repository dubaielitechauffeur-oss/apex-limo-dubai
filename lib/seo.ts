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
 *  site (e.g. the root LimousineService and the homepage's review ratings)
 *  can reference the same node instead of declaring duplicate entities. */
export function organizationId(): string {
  return `${SITE.url}/#organization`;
}

/** LocalBusiness / TransportationCompany JSON-LD for the organization. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LimousineService",
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
