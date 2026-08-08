/**
 * Central source of truth for business information, navigation, and
 * repeated content. Import from here rather than hardcoding strings
 * across components so the site can be updated in one place.
 */

export const SITE = {
  name: "Apex Limo & Chauffeur Dubai",
  shortName: "Apex Limo",
  tagline: "Dubai's Premier Chauffeur & Limousine Service",
  description:
    "Apex Limo & Chauffeur Dubai delivers luxury airport transfers, corporate chauffeur service, and VIP transportation across Dubai — professional drivers, premium vehicles, on-time every time.",
  url: "https://apexchauffeurdubai.com",
  locale: "en-AE",
  phone: "+971529426152",
  phoneDisplay: "+971 52 942 6152",
  whatsapp: "+971529426152",
  email: "apexchauffeurdubai@gmail.com",
} as const;

/**
 * Official aggregate client rating, quoted consistently in copy and
 * structured data everywhere the site references a rating.
 */
export const RATING = "4.9";

/**
 * Verified public profiles for this business, used as the `sameAs` entity
 * links in the LocalBusiness JSON-LD (lib/seo.ts) and available for reuse
 * in UI (footer social row, contact page, etc.).
 *
 * These are the real, owner-supplied profiles — not guesses. Keep them
 * canonical: no tracking/referral query strings (e.g. Instagram's `?igsh=`
 * share parameter), since `sameAs` is an identity assertion and a URL that
 * varies per share breaks that. `googleBusiness` is Google's own short
 * link for the Business Profile listing, which is stable and also serves
 * as the schema `hasMap` target.
 */
export const SOCIAL_PROFILES = {
  googleBusiness: "https://maps.app.goo.gl/FMu7LYvqYaMbzFuo6",
  instagram: "https://www.instagram.com/apex_limo__chauffeur_dubai",
  facebook: "https://www.facebook.com/share/1EcESQGzDM/",
} as const;

/** Every verified profile URL, in the shape schema.org's `sameAs` expects. */
export const SAME_AS_URLS: string[] = Object.values(SOCIAL_PROFILES);

/** Shared schema.org `priceRange` value — quoted in both the root organization
 *  and each per-location LocalBusiness JSON-LD node (lib/seo.ts, and
 *  app/[locale]/locations/[location]/page.tsx). */
export const PRICE_RANGE = "$$$";

/** WhatsApp deep link with a pre-filled inquiry message. `whatsappNumber`
 *  lets a caller pass the live, admin-editable number (see
 *  `lib/public/site-contact.ts`) — omit it to keep using the static
 *  `SITE.whatsapp` default, so every existing call site is unaffected. */
export const getWhatsAppLink = (message?: string, whatsappNumber?: string) => {
  const defaultMessage =
    "Hello Apex Limo, I would like to book a chauffeur service in Dubai.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${(whatsappNumber ?? SITE.whatsapp).replace("+", "")}?text=${text}`;
};

/** `phoneNumber` lets a caller pass the live, admin-editable number — omit
 *  it to keep using the static `SITE.phone` default. */
export const getPhoneLink = (phoneNumber?: string) => `tel:${phoneNumber ?? SITE.phone}`;

/**
 * `key` resolves a label via the "nav" namespace in messages/*.json
 * (e.g. `t(\`nav.${key}\`)`, or `t(\`nav.${parentKey}Children.${childKey}\`)`
 * for a child) — kept separate from `href` so routing never depends on
 * translated text.
 */
export const NAV_LINKS = [
  { key: "home", href: "/" },
  {
    key: "fleet",
    href: "/fleet",
    children: [
      { key: "allFleet", href: "/fleet" },
      { key: "sedan", href: "/fleet/sedan" },
      { key: "suv", href: "/fleet/suv" },
      { key: "van", href: "/fleet/van" },
      { key: "ultraLuxury", href: "/fleet/ultra-luxury" },
      { key: "electric", href: "/fleet/electric" },
    ],
  },
  {
    key: "services",
    href: "/services",
    children: [
      { key: "airportTransfers", href: "/services/airport-transfers" },
      { key: "corporateChauffeur", href: "/services/corporate-chauffeur" },
      { key: "luxuryChauffeur", href: "/services/luxury-chauffeur" },
      { key: "vipTransportation", href: "/services/vip-transportation" },
      { key: "eventTransportation", href: "/services/event-transportation" },
      { key: "weddingChauffeur", href: "/services/wedding-chauffeur" },
    ],
  },
  {
    key: "locations",
    href: "/locations",
    children: [
      { key: "dubaiMarina", href: "/locations/dubai-marina" },
      { key: "downtownDubai", href: "/locations/downtown-dubai" },
      { key: "palmJumeirah", href: "/locations/palm-jumeirah" },
      { key: "businessBay", href: "/locations/business-bay" },
      { key: "jumeirah", href: "/locations/jbr" },
      { key: "dubaiAirport", href: "/locations/dubai-international-airport-dxb" },
    ],
  },
  { key: "about", href: "/about" },
  { key: "faqs", href: "/faqs" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const;

/**
 * Marketing-facing fleet size used in copy across the site (hero, fleet
 * page, about page, homepage carousel). Kept distinct from FLEET.length —
 * the actual vehicle data array that drives real listings/carousels — so
 * the two can vary independently.
 */
export const FLEET_SIZE = "50+";

/** `key` resolves a label via the "cta" namespace in messages/*.json. */
export const PRIMARY_CTA = {
  book: { key: "bookNow", href: "/booking" },
  whatsapp: { key: "whatsappUs", href: getWhatsAppLink() },
  quote: { key: "getInstantQuote", href: "/quote" },
} as const;

export const BRAND_COLORS = {
  black: "#0B0B0B",
  gold: "#D4AF37",
  white: "#FFFFFF",
} as const;
