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
  url: "https://www.apexlimodubai.com",
  locale: "en-AE",
  phone: "+971529426152",
  phoneDisplay: "+971 52 942 6152",
  whatsapp: "+971529426152",
  email: "bookings@apexlimodubai.com",
} as const;

/**
 * Official aggregate client rating, quoted consistently in copy and
 * structured data everywhere the site references a rating.
 */
export const RATING = "4.9";

/** WhatsApp deep link with a pre-filled inquiry message. */
export const getWhatsAppLink = (message?: string) => {
  const defaultMessage =
    "Hello Apex Limo, I would like to book a chauffeur service in Dubai.";
  const text = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/${SITE.whatsapp.replace("+", "")}?text=${text}`;
};

export const getPhoneLink = () => `tel:${SITE.phone}`;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Airport Transfers", href: "/services/airport-transfers" },
      { label: "Corporate Chauffeur", href: "/services/corporate-chauffeur" },
      { label: "Luxury Chauffeur", href: "/services/luxury-chauffeur" },
      { label: "VIP Transportation", href: "/services/vip-transportation" },
      { label: "Event Transportation", href: "/services/event-transportation" },
      { label: "Wedding Chauffeur", href: "/services/wedding-chauffeur" },
    ],
  },
  {
    label: "Locations",
    href: "/locations",
    children: [
      { label: "Dubai Marina", href: "/locations/dubai-marina" },
      { label: "Downtown Dubai", href: "/locations/downtown-dubai" },
      { label: "Palm Jumeirah", href: "/locations/palm-jumeirah" },
      { label: "Business Bay", href: "/locations/business-bay" },
      { label: "Jumeirah", href: "/locations/jbr" },
      { label: "Dubai Airport", href: "/locations/dubai-international-airport-dxb" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
] as const;

export const SERVICES = [
  {
    slug: "airport-transfers",
    name: "Airport Transfers",
    description:
      "Meet-and-greet arrivals and punctual departures at DXB and DWC, with flight tracking built in.",
  },
  {
    slug: "corporate-chauffeur",
    name: "Corporate Chauffeur Service",
    description:
      "Reliable, discreet transport for executives and business travel across the UAE.",
  },
  {
    slug: "luxury-chauffeur",
    name: "Luxury Chauffeur Service",
    description:
      "A premium fleet and professionally trained drivers for everyday luxury travel.",
  },
  {
    slug: "vip-transportation",
    name: "VIP Transportation",
    description:
      "Private, secure transport for high-profile guests, delegations, and dignitaries.",
  },
  {
    slug: "event-transportation",
    name: "Event Transportation",
    description:
      "Coordinated fleets for conferences, galas, and large-scale corporate events.",
  },
  {
    slug: "wedding-chauffeur",
    name: "Wedding Chauffeur Service",
    description:
      "Elegant bridal cars and coordinated convoys for a flawless wedding day.",
  },
] as const;

/**
 * Marketing-facing fleet size used in copy across the site (hero, fleet
 * page, about page, homepage carousel). Kept distinct from FLEET.length —
 * the actual vehicle data array that drives real listings/carousels — so
 * the two can vary independently.
 */
export const FLEET_SIZE = 20;

export const PRIMARY_CTA = {
  book: { label: "Book Now", href: "/booking" },
  whatsapp: { label: "WhatsApp Us", href: getWhatsAppLink() },
  quote: { label: "Get Instant Quote", href: "/quote" },
} as const;

export const BRAND_COLORS = {
  black: "#0B0B0B",
  gold: "#D4AF37",
  white: "#FFFFFF",
} as const;
