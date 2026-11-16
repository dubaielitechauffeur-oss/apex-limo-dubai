/**
 * The catalog of everything the admin "Page SEO" screens can edit.
 *
 * Two kinds of page exist on this site:
 *
 *  1. **CMS records** — a Service, Location, Vehicle or BlogPost row. Their SEO
 *     lives on the row's own `seo` JSON column and is edited on the record's
 *     form. `RECORD_HEADING_SLOTS` lists the section headings each record
 *     type lets an editor override.
 *  2. **Pages with no record** — homepage, about, contact, the listings, the
 *     five fleet categories, the legal pages. Their SEO lives in one
 *     `PageSeo` row each, keyed by the `page` slug of an entry in
 *     `PAGE_SEO_CATALOG`.
 *
 * Every heading on the public site that is NOT CMS content is a next-intl
 * message. That gives two override mechanisms, named by `scope`:
 *
 *  - `"message"` — the slot IS a message key. A saved value replaces that
 *    message for the locale (merged in `i18n/request.ts`), so the page file
 *    needs no change at all and every place the message is used follows.
 *  - `"page"` — the heading is built from a shared template
 *    (`"Why Choose Apex for {name}"`), so replacing the message would change
 *    every record at once. The page reads the override for this one
 *    page/record instead, through `headingOverride()`.
 *
 * This file is plain data with no server imports: the admin forms (client
 * components) and the public read path both use it.
 */

export type HeadingLevel = 1 | 2 | 3;

export interface HeadingSlot {
  /** Storage key inside `seo.headings`. For `scope: "message"` this is the
   *  full message key itself. */
  key: string;
  level: HeadingLevel;
  /** Message key whose text is the default shown when nothing is saved. */
  messageKey: string;
  scope: "message" | "page";
  /** Editor-facing note, e.g. what `{name}` stands for. */
  note?: string;
  /** English default, inlined for the record forms (client components that
   *  cannot load the message files). Kept in sync with `messages/en` by
   *  `lib/seo-pages/__tests__/catalog.test.ts`. */
  defaultText?: string;
}

export type PageSeoGroup = "Main pages" | "Fleet categories" | "Legal pages" | "Shared sections & templates";

export interface PageSeoEntry {
  /** URL-safe slug: the `PageSeo.page` value and the admin route segment. */
  page: string;
  label: string;
  group: PageSeoGroup;
  /** Public path without locale prefix, or null for entries that are not a
   *  single page (shared sections, record templates). */
  publicPath: string | null;
  description?: string;
  /** Message keys holding the built-in meta title/description, shown as the
   *  default. Null for entries that carry headings only. */
  meta: { titleKey: string; descriptionKey: string } | null;
  /** Where the page's H1 comes from. Null when the entry has no H1 of its own. */
  h1: { messageKey: string; scope: "message" | "page" } | null;
  headings: HeadingSlot[];
}

const msg = (key: string, level: HeadingLevel, note?: string): HeadingSlot => ({
  key,
  level,
  messageKey: key,
  scope: "message",
  ...(note ? { note } : {}),
});

const slot = (
  key: string,
  level: HeadingLevel,
  messageKey: string,
  note?: string,
  defaultText?: string
): HeadingSlot => ({
  key,
  level,
  messageKey,
  scope: "page",
  ...(note ? { note } : {}),
  ...(defaultText ? { defaultText } : {}),
});

const legalSections = (namespace: string, extra: HeadingSlot[] = []): HeadingSlot[] => {
  const slots: HeadingSlot[] = [];
  for (let i = 1; i <= 12; i++) {
    slots.push(msg(`${namespace}.s${i}.heading`, 2));
    if (i === 2) slots.push(...extra);
  }
  return slots;
};

export const FLEET_CATEGORY_SLUGS = ["sedan", "suv", "van", "ultra-luxury", "electric"] as const;

const CATEGORY_LABELS: Record<(typeof FLEET_CATEGORY_SLUGS)[number], string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  "ultra-luxury": "Ultra-Luxury",
  electric: "Electric",
};

const CATEGORY_NOTE = "Leave blank to use the shared template, where {category} is the category name.";

/** Section headings of a /fleet/<category> page — built from templates shared
 *  by all five categories, so each is overridden per category. */
export const FLEET_CATEGORY_HEADING_SLOTS: HeadingSlot[] = [
  slot("listing", 2, "fleet.categoryPage.listingTitleTemplate", CATEGORY_NOTE),
  slot("whyChoose", 2, "fleet.categoryPage.whyChooseTitleTemplate", CATEGORY_NOTE),
  slot("occasions", 2, "fleet.categoryPage.occasionsTitleTemplate", CATEGORY_NOTE),
  slot("howToBook", 2, "fleet.categoryPage.howToBookTitleTemplate", CATEGORY_NOTE),
  slot("faq", 2, "fleet.categoryPage.faqTitleTemplate", CATEGORY_NOTE),
];

export function fleetCategoryPageKey(category: string): string {
  return `fleet-${category}`;
}

export const PAGE_SEO_CATALOG: PageSeoEntry[] = [
  {
    page: "home",
    label: "Homepage",
    group: "Main pages",
    publicPath: "/",
    description:
      "The H1 here replaces the hero slide title as the page's main heading. Sections that also appear on other pages (fleet carousel, brands, services grid, why choose us, booking banner) are under “Shared sections”.",
    meta: { titleKey: "metadata.home.title", descriptionKey: "metadata.home.description" },
    h1: { messageKey: "home.hero.titleLine1", scope: "page" },
    headings: [
      msg("home.featureStrip.punctualTitle", 3),
      msg("home.featureStrip.professionalTitle", 3),
      msg("home.featureStrip.safeTitle", 3),
      msg("home.featureStrip.luxuryTitle", 3),
      msg("home.testimonials.title", 2),
      msg("home.faq.title", 2),
    ],
  },
  {
    page: "about",
    label: "About",
    group: "Main pages",
    publicPath: "/about",
    meta: { titleKey: "metadata.about.title", descriptionKey: "metadata.about.description" },
    h1: { messageKey: "about.hero.title", scope: "message" },
    headings: [
      msg("about.ourStory.heading", 2),
      msg("about.values.title", 2),
      msg("about.values.items.0.title", 3),
      msg("about.values.items.1.title", 3),
      msg("about.values.items.2.title", 3),
      msg("about.values.items.3.title", 3),
      msg("about.standards.title", 2),
      msg("about.locations.title", 2),
      msg("about.fleet.title", 2),
      msg("about.whyChoose.title", 2),
      msg("about.whyChoose.items.0.title", 3),
      msg("about.whyChoose.items.1.title", 3),
      msg("about.whyChoose.items.2.title", 3),
      msg("about.whyChoose.items.3.title", 3),
      msg("about.whyChoose.items.4.title", 3),
      msg("about.whyChoose.items.5.title", 3),
      msg("about.testimonials.title", 2),
    ],
  },
  {
    page: "contact",
    label: "Contact",
    group: "Main pages",
    publicPath: "/contact",
    meta: { titleKey: "metadata.contact.title", descriptionKey: "metadata.contact.description" },
    h1: { messageKey: "contact.hero.title", scope: "message" },
    headings: [
      msg("contact.quickContact.title", 2),
      msg("contact.quickContact.cards.0.label", 3),
      msg("contact.quickContact.cards.1.label", 3),
      msg("contact.quickContact.cards.2.label", 3),
      msg("contact.form.title", 2),
      msg("contact.form.panelTitle", 3),
      msg("contact.sidebar.reachUsDirectly", 3),
      msg("contact.sidebar.operatingHours", 3),
      msg("contact.serviceAreas.title", 2),
      msg("contact.whyContact.title", 2),
      msg("contact.whyContact.items.0.title", 3),
      msg("contact.whyContact.items.1.title", 3),
      msg("contact.whyContact.items.2.title", 3),
      msg("contact.whyContact.items.3.title", 3),
      msg("contact.whyContact.items.4.title", 3),
      msg("contact.whyContact.items.5.title", 3),
      msg("contact.faqSection.title", 2),
      msg("contact.finalCta.heading", 2),
    ],
  },
  {
    page: "faqs",
    label: "FAQs",
    group: "Main pages",
    publicPath: "/faqs",
    meta: { titleKey: "metadata.faqs.title", descriptionKey: "metadata.faqs.description" },
    h1: { messageKey: "faqs.hero.title", scope: "message" },
    headings: [
      msg("faqs.categories.booking.label", 2),
      msg("faqs.categories.airport-transfers.label", 2),
      msg("faqs.categories.pricing.label", 2),
      msg("faqs.categories.fleet.label", 2),
      msg("faqs.categories.corporate-travel.label", 2),
      msg("faqs.categories.wedding-chauffeurs.label", 2),
      msg("faqs.categories.vip-transportation.label", 2),
      msg("faqs.categories.locations.label", 2),
      msg("faqs.categories.safety.label", 2),
      msg("faqs.categories.general-questions.label", 2),
      msg("faqs.finalCta.heading", 2),
    ],
  },
  {
    page: "services",
    label: "Services listing",
    group: "Main pages",
    publicPath: "/services",
    description: "The service cards' headings are each service's name — edit those in Services.",
    meta: { titleKey: "metadata.services.title", descriptionKey: "metadata.services.description" },
    h1: { messageKey: "services.hero.title", scope: "message" },
    headings: [msg("services.listing.title", 2), msg("services.faq.title", 2), msg("services.finalCta.heading", 2)],
  },
  {
    page: "locations",
    label: "Locations listing",
    group: "Main pages",
    publicPath: "/locations",
    description: "The location cards' headings are each location's name — edit those in Locations.",
    meta: { titleKey: "metadata.locations.title", descriptionKey: "metadata.locations.description" },
    h1: { messageKey: "locations.hero.title", scope: "message" },
    headings: [msg("locations.listing.title", 2)],
  },
  {
    page: "fleet",
    label: "Fleet listing",
    group: "Main pages",
    publicPath: "/fleet",
    description: "The vehicle cards' headings are each vehicle's name — edit those in Fleet.",
    meta: { titleKey: "metadata.fleet.title", descriptionKey: "metadata.fleet.description" },
    h1: { messageKey: "fleet.hero.titleTemplate", scope: "message" },
    headings: [
      msg("fleet.concierge.title", 2),
      msg("fleet.concierge.recommendations.mercedesSClass.name", 3),
      msg("fleet.concierge.recommendations.mercedesVClass.name", 3),
      msg("fleet.concierge.recommendations.rollsRoyce.name", 3),
      msg("fleet.concierge.recommendations.rangeRover.name", 3),
    ],
  },
  {
    page: "blog",
    label: "Blog listing",
    group: "Main pages",
    publicPath: "/blog",
    description: "The article cards' headings are each post's title — edit those in Blog.",
    meta: { titleKey: "metadata.blog.title", descriptionKey: "metadata.blog.description" },
    h1: { messageKey: "blog.hero.title", scope: "message" },
    headings: [],
  },
  {
    page: "booking",
    label: "Booking",
    group: "Main pages",
    publicPath: "/booking",
    meta: { titleKey: "metadata.booking.title", descriptionKey: "metadata.booking.description" },
    h1: { messageKey: "forms.booking.pageHeading", scope: "message" },
    headings: [],
  },
  {
    page: "quote",
    label: "Quote",
    group: "Main pages",
    publicPath: "/quote",
    meta: { titleKey: "metadata.quote.title", descriptionKey: "metadata.quote.description" },
    h1: { messageKey: "forms.quote.pageHeading", scope: "message" },
    headings: [],
  },
  ...FLEET_CATEGORY_SLUGS.map(
    (category): PageSeoEntry => ({
      page: fleetCategoryPageKey(category),
      label: `Fleet category — ${CATEGORY_LABELS[category]}`,
      group: "Fleet categories",
      publicPath: `/fleet/${category}`,
      meta: {
        titleKey: `metadata.fleetCategory.title.${category}`,
        descriptionKey: `metadata.fleetCategory.description.${category}`,
      },
      // Page-scope: this key only exists in the English messages, so a
      // message-level override could never reach the other five locales.
      h1: { messageKey: `fleet.categoryPage.h1.${category}`, scope: "page" },
      headings: FLEET_CATEGORY_HEADING_SLOTS,
    })
  ),
  {
    page: "privacy-policy",
    label: "Privacy Policy",
    group: "Legal pages",
    publicPath: "/privacy-policy",
    meta: { titleKey: "metadata.privacyPolicy.title", descriptionKey: "metadata.privacyPolicy.description" },
    h1: { messageKey: "legal.privacyPolicy.title", scope: "message" },
    headings: legalSections("legal.privacyPolicy", [
      msg("legal.privacyPolicy.s2.sub1Heading", 3),
      msg("legal.privacyPolicy.s2.sub2Heading", 3),
      msg("legal.privacyPolicy.s2.sub3Heading", 3),
      msg("legal.privacyPolicy.s2.sub4Heading", 3),
      msg("legal.privacyPolicy.s2.sub5Heading", 3),
    ]),
  },
  {
    page: "terms",
    label: "Terms & Conditions",
    group: "Legal pages",
    publicPath: "/terms",
    meta: { titleKey: "metadata.terms.title", descriptionKey: "metadata.terms.description" },
    h1: { messageKey: "legal.terms.title", scope: "message" },
    headings: legalSections("legal.terms"),
  },
  {
    page: "shared-sections",
    label: "Shared sections",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Sections that appear on several pages. A change here shows on every page that uses the section (homepage, about, service, location, fleet, booking and quote pages).",
    meta: null,
    h1: null,
    headings: [
      msg("fleet.carousel.title", 2),
      msg("home.brandsShowcase.title", 2),
      msg("services.grid.title", 2),
      msg("locations.showcase.title", 2),
      msg("home.whyChooseUs.title", 2),
      msg("home.whyChooseUs.licensedTitle", 3),
      msg("home.whyChooseUs.maintainedTitle", 3),
      msg("home.whyChooseUs.availabilityTitle", 3),
      msg("home.whyChooseUs.pricingTitle", 3),
      msg("home.whyChooseUs.punctualityTitle", 3),
      msg("home.whyChooseUs.corporateTitle", 3),
      msg("locations.coverage.title", 2),
      msg("common.bookingCta.heading", 2),
      msg("forms.conversion.trustPanel.panelHeading", 2),
      msg("forms.conversion.trustPanel.whatHappensNext", 3),
      msg("fleet.detail.step1Title", 3),
      msg("fleet.detail.step2Title", 3),
      msg("fleet.detail.step3Title", 3),
    ],
  },
  {
    page: "template-service",
    label: "Service page template",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Default section headings for every /services/… page. {name} is replaced by the service name. A heading set on an individual service (Services → edit → SEO) wins over these.",
    meta: null,
    h1: null,
    headings: [
      msg("services.detail.titleSuffix", 1, "Default H1 for a service with no H1 of its own."),
      msg("services.detail.ratingTitleTemplate", 2),
      msg("services.detail.benefitsTitle", 2),
      msg("services.detail.whyChooseTitleTemplate", 2),
      msg("services.otherServices.title", 2),
      msg("services.detail.faqTitleTemplate", 2),
    ],
  },
  {
    page: "template-location",
    label: "Location page template",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Default section headings for every /locations/… page. {name} is replaced by the location name. A heading set on an individual location wins over these.",
    meta: null,
    h1: null,
    headings: [
      msg("locations.detail.titleTemplate", 1, "Default H1 for a location with no H1 of its own."),
      msg("locations.detail.whyChooseTitleTemplate", 2),
      msg("locations.detail.commonJourneysTitleTemplate", 2),
      msg("locations.detail.faqTitleTemplate", 2),
      msg("locations.detail.otherAreasTitle", 2),
    ],
  },
  {
    page: "template-vehicle",
    label: "Vehicle page template",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Default section headings for every vehicle page. {name} is replaced by the vehicle name. A heading set on an individual vehicle wins over these.",
    meta: null,
    h1: null,
    headings: [
      msg("fleet.heroQuoteForm.requestQuote", 2),
      msg("fleet.detail.featuresTitle", 2),
      msg("fleet.detail.availablePackages", 2),
      msg("fleet.detail.whyChooseTitleTemplate", 2),
      msg("fleet.detail.howItWorksTitle", 2),
      msg("fleet.detail.aboutTitleTemplate", 2),
      msg("fleet.detail.exploreSimilarTitle", 2),
      msg("fleet.faqSection.titleTemplate", 2),
    ],
  },
  {
    page: "template-fleet-category",
    label: "Fleet category template",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Default section headings for the five /fleet/<category> pages. {category} is replaced by the category name. A heading set on an individual category wins over these.",
    meta: null,
    h1: null,
    headings: [
      msg("fleet.categoryPage.listingTitleTemplate", 2),
      msg("fleet.categoryPage.whyChooseTitleTemplate", 2),
      msg("fleet.categoryPage.occasionsTitleTemplate", 2),
      msg("fleet.categoryPage.howToBookTitleTemplate", 2),
      msg("fleet.categoryPage.faqTitleTemplate", 2),
    ],
  },
  {
    page: "template-blog-post",
    label: "Blog post template",
    group: "Shared sections & templates",
    publicPath: null,
    description:
      "Headings every blog post shares. A post's own H1 is its title and its H2/H3 come from the article body — edit those in Blog.",
    meta: null,
    h1: null,
    headings: [msg("blog.detail.moreFromJournalTitle", 2), msg("blog.detail.bookingCtaHeading", 2)],
  },
];

const ENTRY_BY_PAGE = new Map(PAGE_SEO_CATALOG.map((entry) => [entry.page, entry]));

export function getPageSeoEntry(page: string): PageSeoEntry | undefined {
  return ENTRY_BY_PAGE.get(page);
}

export type RecordSeoType = "service" | "location" | "vehicle" | "blogPost";

const RECORD_NOTE = "Leave blank to use the shared heading. {name} is replaced by this item's name.";

/** Section headings an individual CMS record can override on its own page. */
export const RECORD_HEADING_SLOTS: Record<RecordSeoType, HeadingSlot[]> = {
  service: [
    slot("rating", 2, "services.detail.ratingTitleTemplate", RECORD_NOTE, "Why {name} Clients Choose Apex"),
    slot("benefits", 2, "services.detail.benefitsTitle", RECORD_NOTE, "What's Included"),
    slot("whyChoose", 2, "services.detail.whyChooseTitleTemplate", RECORD_NOTE, "Why Choose Apex for {name}"),
    slot("otherServices", 2, "services.otherServices.title", RECORD_NOTE, "Other Services"),
    slot("faq", 2, "services.detail.faqTitleTemplate", RECORD_NOTE, "{name} FAQs"),
  ],
  location: [
    slot("whyChoose", 2, "locations.detail.whyChooseTitleTemplate", RECORD_NOTE, "Why Choose Apex in {name}"),
    slot("commonJourneys", 2, "locations.detail.commonJourneysTitleTemplate", RECORD_NOTE, "Common Journeys From {name}"),
    slot("faq", 2, "locations.detail.faqTitleTemplate", RECORD_NOTE, "{name} FAQs"),
    slot("otherAreas", 2, "locations.detail.otherAreasTitle", RECORD_NOTE, "Other Areas We Serve"),
  ],
  vehicle: [
    slot("features", 2, "fleet.detail.featuresTitle", RECORD_NOTE, "Features & Amenities"),
    slot("packages", 2, "fleet.detail.availablePackages", RECORD_NOTE, "Available Chauffeur Packages"),
    slot("whyChoose", 2, "fleet.detail.whyChooseTitleTemplate", RECORD_NOTE, "Why Choose the {name}"),
    slot("howItWorks", 2, "fleet.detail.howItWorksTitle", RECORD_NOTE, "How It Works"),
    slot("about", 2, "fleet.detail.aboutTitleTemplate", RECORD_NOTE, "About the {name}"),
    slot("similar", 2, "fleet.detail.exploreSimilarTitle", RECORD_NOTE, "Explore Similar Vehicles"),
    slot("faq", 2, "fleet.faqSection.titleTemplate", RECORD_NOTE, "{name} FAQs"),
  ],
  // A post's H2/H3 are part of its article body, edited in the content field.
  blogPost: [],
};

/** Message key holding the default H1 for a record type, shown as a hint. */
export const RECORD_H1_DEFAULT_KEY: Record<RecordSeoType, string | null> = {
  service: "services.detail.titleSuffix",
  location: "locations.detail.titleTemplate",
  vehicle: null,
  blogPost: null,
};

/** Every slot key a `seo.headings` object may legitimately contain, per owner. */
export function allowedHeadingKeys(slots: readonly HeadingSlot[]): Set<string> {
  return new Set(slots.map((s) => s.key));
}
