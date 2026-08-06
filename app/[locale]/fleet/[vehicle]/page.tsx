import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  Users,
  Briefcase,
  Star,
  Crown,
  Compass,
  Wifi,
  GlassWater,
  Snowflake,
  EyeOff,
  Lightbulb,
  MonitorPlay,
  Sun,
  DoorOpen,
  Gauge,
  Volume2,
  Baby,
  Gem,
  Shirt,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  ClipboardCheck,
  Car,
  UserCheck,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import Card from "@/components/shared/Card";
import Reveal from "@/components/shared/Reveal";
import Ltr from "@/components/shared/Ltr";
import VehicleHeroGallery, { VehicleGalleryCarousel } from "@/components/fleet/VehicleHeroGallery";
import VehicleHeroQuoteForm from "@/components/fleet/VehicleHeroQuoteForm";
import VehicleFaqSection from "@/components/fleet/VehicleFaqSection";
import FleetTrustSection from "@/components/fleet/FleetTrustSection";
import FleetCarouselCard from "@/components/home/FleetCarouselCard";
import FleetListingCard from "@/components/fleet/FleetListingCard";
import CoverageBlock from "@/components/shared/CoverageBlock";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE, RATING, getWhatsAppLink } from "@/lib/constants";
import {
  FLEET,
  getAllVehicles,
  getVehicleBySlug,
  FLEET_CATEGORY_SLUGS,
  isFleetCategorySlug,
  getVehiclesByCategorySlug,
  type PlainFleetVehicle,
  type FleetCategorySlug,
} from "@/data/fleet";
import { getServiceBySlug } from "@/data/services";
import { getLocationBySlug } from "@/data/locations";
import { VEHICLE_CROSS_LINKS } from "@/lib/cross-links";

interface PageProps {
  // "vehicle" also carries a fleet category slug (sedan/suv/van/electric) —
  // Next.js requires the same dynamic segment name at a given route
  // position, so /fleet/[vehicle] serves both the vehicle detail page and
  // the category listing pages rather than introducing a sibling
  // /fleet/[category] segment.
  params: Promise<{ locale: string; vehicle: string }>;
}

export async function generateStaticParams() {
  const vehicleParams = FLEET.map((vehicle) => ({ vehicle: vehicle.slug }));
  const categoryParams = FLEET_CATEGORY_SLUGS.map((category) => ({ vehicle: category }));
  return [...vehicleParams, ...categoryParams];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, vehicle: slug } = await params;

  if (isFleetCategorySlug(slug)) {
    return generateCategoryMetadata(locale as Locale, slug);
  }

  const vehicle = getVehicleBySlug(slug, locale as Locale);
  const t = await getTranslations({ locale, namespace: "metadata.fleetVehicle" });

  if (!vehicle) {
    return buildMetadata({
      locale: locale as Locale,
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      path: `/fleet/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    title: t("titleTemplate", { name: vehicle.name, category: vehicle.category }),
    description: t("descriptionTemplate", { name: vehicle.name, description: vehicle.description }),
    path: `/fleet/${vehicle.slug}`,
  });
}

async function generateCategoryMetadata(locale: Locale, category: FleetCategorySlug): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata.fleetCategory" });
  const tLabel = await getTranslations({ locale, namespace: "fleet.categoryPage" });
  const categoryLabel = tLabel(`labels.${category}`);

  return buildMetadata({
    locale,
    title: t("titleTemplate", { category: categoryLabel }),
    description: t("descriptionTemplate", { category: categoryLabel }),
    path: `/fleet/${category}`,
  });
}

/** Car + FAQPage JSON-LD for this specific vehicle. */
function vehicleJsonLd(vehicle: PlainFleetVehicle, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    inLanguage: locale,
    name: vehicle.name,
    description: vehicle.longDescription,
    vehicleSeatingCapacity: vehicle.passengers,
    url: `${SITE.url}${localizedPath(locale, `/fleet/${vehicle.slug}`)}`,
    provider: {
      "@type": "LocalBusiness",
      "additionalType": "https://schema.org/LimousineService",
      "@id": organizationId(),
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
    },
  };
}

/** Best-effort keyword match from a plain-text feature/amenity string to a
 *  representative icon, purely presentational — the underlying
 *  `vehicle.features` data is untouched. Always matched against the
 *  English source string (by array index) rather than the localized
 *  display string, since the keyword list below is English-only and the
 *  feature array's order/length is identical across all locales. */
function amenityIcon(feature: string): LucideIcon {
  const f = feature.toLowerCase();
  if (f.includes("wifi") || f.includes("wi-fi")) return Wifi;
  if (f.includes("child seat")) return Baby;
  if (f.includes("diamond")) return Gem;
  if (f.includes("starlight") || f.includes("headliner")) return Sparkles;
  if (f.includes("attire") || f.includes("red carpet")) return Shirt;
  if (f.includes("climate") || f.includes("insulation")) return Snowflake;
  if (f.includes("privacy") || f.includes("curtain") || f.includes("tinted") || f.includes("glass"))
    return EyeOff;
  if (f.includes("light")) return Lightbulb;
  if (f.includes("entertainment") || f.includes("screen")) return MonitorPlay;
  if (f.includes("roof") || f.includes("sky lounge")) return Sun;
  if (f.includes("door")) return DoorOpen;
  if (f.includes("suspension") || f.includes("ride height") || f.includes("elevated")) return Gauge;
  if (f.includes("sound") || f.includes("audio")) return Volume2;
  if (f.includes("luggage")) return Briefcase;
  if (f.includes("water") || f.includes("champagne") || f.includes("amenities")) return GlassWater;
  if (
    f.includes("seat") ||
    f.includes("leg") ||
    f.includes("lounge") ||
    f.includes("captain") ||
    f.includes("bench") ||
    f.includes("ottoman")
  )
    return Sparkles;
  if (f.includes("leather") || f.includes("handcrafted") || f.includes("quilted")) return Sparkles;
  return CheckCircle2;
}

/** ItemList JSON-LD for a fleet category listing page. */
function categoryJsonLd(locale: Locale, category: FleetCategorySlug, categoryLabel: string, vehicles: PlainFleetVehicle[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: locale,
    name: `${SITE.name} ${categoryLabel} Fleet`,
    url: `${SITE.url}${localizedPath(locale, `/fleet/${category}`)}`,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Car",
        name: vehicle.name,
        description: vehicle.description,
        vehicleSeatingCapacity: vehicle.passengers,
        provider: {
          "@type": "LocalBusiness",
          "additionalType": "https://schema.org/LimousineService",
          "@id": organizationId(),
          name: SITE.name,
        },
      },
    })),
  };
}

/**
 * Fleet category listing (/fleet/sedan, /fleet/suv, /fleet/van,
 * /fleet/electric) — the same FLEET data and FleetListingCard used on the
 * main /fleet page, filtered to one category. No new card component, no
 * duplicated vehicle data.
 */
async function FleetCategoryListing({ locale, category }: { locale: Locale; category: FleetCategorySlug }) {
  setRequestLocale(locale);
  const vehicles = getVehiclesByCategorySlug(category, locale);
  const t = await getTranslations("fleet.categoryPage");
  const tHero = await getTranslations("fleet.hero");
  const tNav = await getTranslations("common.nav");
  const tA11y = await getTranslations("common.a11y");
  const categoryLabel = t(`labels.${category}`);
  const filledStars = Math.round(parseFloat(RATING));

  const TRUST_ITEMS = [
    { icon: Car, label: t("vehicleCountTemplate", { count: vehicles.length }) },
    { icon: UserCheck, label: tHero("professionalChauffeurs") },
    { icon: MapPin, label: tHero("availableAcross") },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd(locale, category, categoryLabel, vehicles)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tNav("fleet"), path: "/fleet" },
                { name: categoryLabel, path: `/fleet/${category}` },
              ],
              locale,
              tNav("home")
            )
          ),
        }}
      />

      {/* Hero — sized and animated to match the /fleet page's FleetHero
          (min-height + fade/slide-in stagger), centered content and a
          trust-indicators row instead of that hero's photograph, since
          there's no single image representing a filtered category. */}
      <Section
        tone="obsidian"
        separator={false}
        className="relative flex min-h-[420px] items-center overflow-hidden !py-16 sm:min-h-[520px] sm:!py-20 lg:min-h-[560px]"
      >
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <nav
              aria-label={t("breadcrumbAriaLabel")}
              className="flex animate-fade-in items-center justify-center gap-1 text-xs uppercase text-smoke"
            >
              <Link href="/" className="transition-colors hover:text-gold">
                {tNav("home")}
              </Link>
              <span className="text-smoke/40">/</span>
              <Link href="/fleet" className="transition-colors hover:text-gold">
                {tNav("fleet")}
              </Link>
              <span className="text-smoke/40">/</span>
              <span className="text-gold">{categoryLabel}</span>
            </nav>

            <span className="mt-8 block animate-fade-in label-eyebrow [animation-delay:100ms]">
              {t("eyebrow")}
            </span>
            <h1 className="mt-4 animate-slide-in-left font-display text-4xl leading-[1.05] text-heading [animation-delay:150ms] sm:text-6xl">
              {t("titleTemplate", { category: categoryLabel })}
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-fade-in text-base leading-relaxed text-smoke [animation-delay:300ms] sm:text-lg">
              {t(`subtitle.${category}`)}
            </p>

            {/* Trust indicators — same rating-stars + stat-row pattern as
                FleetHero on /fleet, with a category-specific vehicle count
                in place of the site-wide fleet size. */}
            <div className="mt-9 flex animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-3 [animation-delay:450ms]">
              <div className="flex items-center gap-2">
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold/30"}`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-heading">
                  <Ltr>{tHero("ratingTemplate", { rating: RATING })}</Ltr>
                </span>
              </div>

              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
                  <item.icon className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-sm text-smoke">
                    <Ltr>{item.label}</Ltr>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="fleet-category-listings" tone="ivory">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("listingEyebrow")}
              title={t("listingTitleTemplate", { category: categoryLabel })}
              align="left"
              tone="light"
            />
          </Reveal>

          {vehicles.length > 0 ? (
            <div className="mt-10 flex flex-col gap-8">
              {vehicles.map((vehicle, index) => (
                <Reveal key={vehicle.slug} delay={Math.min(index * 60, 300)}>
                  <FleetListingCard vehicle={vehicle} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-graphite">{t("emptyState")}</p>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/fleet"
              className="inline-flex items-center justify-center rounded-lg border border-gold-deep/40 px-6 py-3 text-xs font-bold uppercase tracking-wide text-gold-deep transition-colors duration-200 hover:bg-gold/10"
            >
              {t("viewFullFleet")}
            </Link>
          </div>
        </Container>
      </Section>

      <FleetTrustSection />
      <CoverageBlock />
      <BookingCTA />
    </div>
  );
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { locale, vehicle: slug } = await params;

  if (isFleetCategorySlug(slug)) {
    return <FleetCategoryListing locale={locale as Locale} category={slug} />;
  }

  setRequestLocale(locale as Locale);
  const vehicle = getVehicleBySlug(slug, locale as Locale);

  if (!vehicle) {
    notFound();
  }

  const t = await getTranslations("fleet.detail");
  const tNav = await getTranslations("common.nav");
  const tCard = await getTranslations("fleet.card");
  const tA11y = await getTranslations("common.a11y");
  const cardLabels = {
    imageComingSoon: tCard("imageComingSoon"),
    tenHours: tCard("tenHours"),
    fiveHours: tCard("fiveHours"),
    oneHour: tCard("oneHour"),
    airport: tCard("airport"),
    priceOnRequest: tCard("priceOnRequest"),
    viewCar: tCard("viewCar"),
    whatsapp: tCard("whatsapp"),
    whatsappMessageTemplate: tCard("whatsappMessageTemplate"),
  };

  const HOW_IT_WORKS = [
    { icon: MessageCircle, title: t("step1Title"), description: t("step1Description") },
    { icon: ClipboardCheck, title: t("step2Title"), description: t("step2Description") },
    { icon: Car, title: t("step3Title"), description: t("step3Description") },
  ];

  // English source features, used only to keyword-match a presentational
  // icon (see amenityIcon) — the vehicle's own (possibly non-English)
  // features array, same length/order, is what's actually displayed.
  const englishFeatures = FLEET.find((v) => v.slug === vehicle.slug)?.features.en ?? vehicle.features;

  // "Similar" prioritizes same-category vehicles first, then fills any
  // remaining slots from the rest of the fleet — still existing fleet data,
  // just a more meaningful match than an arbitrary slice.
  const allVehicles = getAllVehicles(locale as Locale);
  const sameCategory = allVehicles.filter((v) => v.slug !== vehicle.slug && v.category === vehicle.category);
  const otherCategory = allVehicles.filter((v) => v.slug !== vehicle.slug && v.category !== vehicle.category);
  const similarVehicles = [...sameCategory, ...otherCategory].slice(0, 3);

  const whatsappMessage = t("whatsappMessage", { name: vehicle.name });
  const filledStars = Math.round(parseFloat(RATING));

  const crossLinks = VEHICLE_CROSS_LINKS[vehicle.slug];
  const relatedService = crossLinks
    ? getServiceBySlug(crossLinks.serviceSlug, locale as Locale)
    : undefined;
  const relatedLocation = crossLinks
    ? getLocationBySlug(crossLinks.locationSlug, locale as Locale)
    : undefined;

  const categoryLabel = t(`categories.${vehicle.category}`);

  const quickFacts = [
    { label: t("quickFacts.category"), value: categoryLabel, icon: Crown },
    { label: t("quickFacts.passengers"), value: `${vehicle.passengers} ${t("quickFacts.passengers")}`, icon: Users },
    { label: t("quickFacts.luggage"), value: `${vehicle.luggage} ${t("quickFacts.luggage")}`, icon: Briefcase },
    { label: t("quickFacts.bestFor"), value: vehicle.idealFor, icon: Compass },
  ];

  // Desktop-only "Features & Amenities" grid — merges the former Quick
  // Facts strip (4 cards) with the feature list (typically 6 cards) into
  // one 10-card grid directly under the hero. Every card uses the same
  // single-line icon + white-text template (no separate label line) so
  // all 10 are visually identical in height/size, not just visually
  // similar. Mobile is untouched: it never showed Quick Facts as its own
  // grid (already folded into the hero meta row), and keeps the separate
  // Features & Amenities section further down the page exactly as before.
  const specCards: { icon: LucideIcon; text: string }[] = [
    ...quickFacts.map((fact) => ({ icon: fact.icon, text: fact.value })),
    ...vehicle.features.map((feature, index) => ({
      icon: amenityIcon(englishFeatures[index] ?? feature),
      text: feature,
    })),
  ];

  const priceTierLabels = [
    { label: t("oneHour"), suffix: t("withinDubaiSuffix") },
    { label: t("airportTransfer") },
    { label: t("fiveHours"), suffix: t("halfDaySuffix") },
    { label: t("tenHours"), suffix: t("fullDaySuffix") },
  ];

  // Desktop-only package grid — 4 tiers only (Additional Hour/Additional
  // City dropped), 2 Hours instead of 1 Hour, 5 Hours called out as "Most
  // Popular". Mobile keeps the original 6-tier, oneHour-first array and
  // plain (non-highlighted) card styling above, untouched.
  const priceTiersDesktop = [
    { label: t("oneWayTransfer"), suffix: t("withinDubaiSuffix"), highlight: false },
    { label: t("airportTransfer"), highlight: false },
    { label: t("fiveHours"), suffix: t("halfDaySuffix"), highlight: true },
    { label: t("tenHours"), suffix: t("fullDaySuffix"), highlight: false },
  ];

  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd(vehicle, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(vehicle.faqs, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tNav("fleet"), path: "/fleet" },
                { name: vehicle.name, path: `/fleet/${vehicle.slug}` },
              ],
              locale as Locale,
              tNav("home")
            )
          ),
        }}
      />

      {/* Hero zone. Mobile (unchanged): single column — breadcrumb, title
          block, gallery, description/meta/CTA. Desktop (new): breadcrumb,
          a title block with rating + tags, then a two-column row —
          image carousel beside an embedded quote form — replacing the old
          gallery-then-CTA-buttons stack. */}
      <Section tone="obsidian" padding="sm" separator={false} className="!pt-6 !pb-8 lg:!pb-16">
      <Container>
        <div className="mx-auto max-w-3xl lg:max-w-none">
          <nav aria-label={t("breadcrumbAriaLabel")} className="flex animate-fade-in items-center gap-1 text-xs uppercase text-smoke">
            <Link href="/" className="transition-colors hover:text-gold">
              {tNav("home")}
            </Link>
            <span className="text-smoke/40">/</span>
            <Link href="/fleet" className="transition-colors hover:text-gold">
              {tNav("fleet")}
            </Link>
            <span className="text-smoke/40">/</span>
            <span className="text-gold">{vehicle.name}</span>
          </nav>

          {/* Mobile-only info block — shows title/category/passengers before
              the gallery. */}
          <div className="mt-6 lg:hidden">
            <h1 className="animate-slide-in-left font-display text-3xl text-heading [animation-delay:100ms]">
              {vehicle.name} <span className="text-smoke">{t("withChauffeurInDubai")}</span>
            </h1>
            <p className="mt-2 animate-fade-in text-base italic text-gold/90 [animation-delay:250ms]">{vehicle.tagline}</p>
            <div className="mt-3 flex animate-fade-in flex-wrap items-center gap-2 text-sm text-smoke [animation-delay:350ms]">
              <span>{categoryLabel}</span>
              <span className="text-gold">&bull;</span>
              <span>{t("passengersLabel", { count: vehicle.passengers })}</span>
            </div>
            <div className="mt-3 flex animate-fade-in items-center gap-2 [animation-delay:400ms]">
              <div className="flex gap-0.5" role="img" aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold/30"}`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm text-smoke">{t("ratingTemplate", { rating: RATING })}</span>
            </div>
          </div>

          <div className="mt-6 animate-fade-in sm:mt-8 lg:hidden [animation-delay:200ms]">
            <VehicleHeroGallery vehicle={vehicle} />
          </div>

          {/* Mobile-only — description, meta row, related cross-link. CTA
              buttons live only in the pricing card further down the page
              (Book Now / Enquire on WhatsApp), not duplicated here.
              Desktop's equivalent content now lives in the two-column
              block below instead. */}
          <div className="mt-8 lg:hidden">
            <p className="text-sm leading-relaxed text-smoke sm:text-base">
              {vehicle.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-gold/15 py-4 text-sm text-smoke">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {t("passengersShort", { count: vehicle.passengers })}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {t("bagsShort", { count: vehicle.luggage })}
              </span>
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-gold" strokeWidth={1.5} />
                {vehicle.idealFor}
              </span>
            </div>

            {relatedService || relatedLocation ? (
              <p className="mt-6 text-sm text-smoke">
                {relatedService ? (
                  <>
                    {t("popularFor")}{" "}
                    <Link
                      href={`/services/${relatedService.slug}`}
                      className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                    >
                      {relatedService.name}
                    </Link>
                  </>
                ) : null}
                {relatedService && relatedLocation ? ` ${t("inConnector")} ` : null}
                {relatedLocation ? (
                  <Link
                    href={`/locations/${relatedLocation.slug}`}
                    className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                  >
                    {relatedLocation.name}
                  </Link>
                ) : null}
                .
              </p>
            ) : null}
          </div>

          {/* Desktop-only hero — title/rating/tags, then a two-column row:
              image carousel beside an embedded quote form. */}
          <div className="hidden lg:block">
            <span className="label-eyebrow animate-fade-in">{categoryLabel}</span>
            <h1 className="mt-4 animate-slide-in-left font-display text-5xl text-heading [animation-delay:100ms] xl:text-6xl">
              {vehicle.name}
            </h1>
            <p className="mt-3 animate-fade-in text-lg italic text-gold/90 [animation-delay:250ms]">{vehicle.tagline}</p>

            <div className="mt-4 flex animate-fade-in flex-wrap items-center gap-3 text-sm text-smoke [animation-delay:350ms]">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5" role="img" aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold/30"}`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <span>{t("ratingTemplate", { rating: RATING })}</span>
              </div>
              <span className="text-gold">&bull;</span>
              <span>{categoryLabel}</span>
              <span className="text-gold">&bull;</span>
              <span>{t("passengersLabel", { count: vehicle.passengers })}</span>
              <span className="text-gold">&bull;</span>
              <span>{vehicle.luggage} {t("quickFacts.luggage")}</span>
            </div>

            <div className="mt-8 grid animate-fade-in grid-cols-[3fr_2fr] items-start gap-10 [animation-delay:450ms] xl:gap-14">
              <div>
                <VehicleGalleryCarousel vehicle={vehicle} sizes="(min-width: 1280px) 640px, 55vw" />
                <p className="mt-6 text-base leading-relaxed text-smoke">
                  {vehicle.description}
                </p>
              </div>
              <VehicleHeroQuoteForm vehicle={vehicle} />
            </div>

            {relatedService || relatedLocation ? (
              <p className="mt-6 text-sm text-smoke">
                {relatedService ? (
                  <>
                    {t("popularFor")}{" "}
                    <Link
                      href={`/services/${relatedService.slug}`}
                      className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                    >
                      {relatedService.name}
                    </Link>
                  </>
                ) : null}
                {relatedService && relatedLocation ? ` ${t("inConnector")} ` : null}
                {relatedLocation ? (
                  <Link
                    href={`/locations/${relatedLocation.slug}`}
                    className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                  >
                    {relatedLocation.name}
                  </Link>
                ) : null}
                .
              </p>
            ) : null}
          </div>
        </div>
      </Container>
      </Section>

      {/* Specs zone, part 1 — Features & Amenities (desktop) + Pricing.
          Split into two Sections around the trust stats band below
          (desktop only) so its order matches "Features -> Packages ->
          trust stats" flow; mobile never sees the stats band regardless
          of this split. */}
      <Section tone="obsidian" className="!pt-8 lg:!pt-24">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Features & Amenities — desktop only. Merges the former Quick
            Facts strip with the feature list into a single 10-card grid,
            right under the hero. Every card is the same single-line icon
            + white-text template — no separate label line — so all 10
            cards are exactly the same size, not just similarly sized.
            Mobile's separate, unmerged Features & Amenities section
            further down the page is untouched. */}
        <div className="hidden lg:block">
          <Reveal>
            <SectionHeading
              eyebrow={t("onboardEyebrow")}
              title={t("featuresTitle")}
              align="left"
              tone="dark"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {specCards.map((card, index) => (
              <Reveal key={index} delay={Math.min(index * 60, 400)}>
                <div className="flex items-center gap-3 rounded-xl border border-gold/15 bg-charcoal p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-[0_12px_30px_-18px_rgba(212,175,55,0.35)]">
                  <card.icon className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="text-sm text-white">{card.text}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <Reveal>
          <h2 className="font-display text-2xl text-heading sm:text-3xl">
            {t("availablePackages")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
            {t("packagesSubtitle")}
          </p>

          {/* Mobile package grid — unchanged from before (1 Hour first,
              no highlight, original spacing). */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gold/15 bg-charcoal px-6 py-6 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.9)] sm:grid-cols-3 lg:hidden">
            {priceTierLabels.map((tier) => (
              <div key={tier.label} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-smoke">
                  {tier.label}
                  {tier.suffix ? (
                    <span className="ms-1 text-[9px] normal-case text-smoke/70">{tier.suffix}</span>
                  ) : null}
                </span>
                <span className="font-display text-lg font-bold text-gold">
                  {t("priceOnRequest")}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop package grid — 2 columns x 2 rows, 4 tiers (Additional
              Hour / Additional City dropped), 2 Hours instead of 1 Hour, 5
              Hours called out as Most Popular. Cards are a fixed, larger
              size (w-72, p-6) rather than shrink-wrapped to their text, so
              the grid reads as a deliberate block instead of a cluster of
              undersized tiles. */}
          <div className="mt-6 hidden lg:grid lg:grid-cols-[max-content_max-content] lg:gap-5">
            {priceTiersDesktop.map((tier) => (
              <div
                key={tier.label}
                className={`relative flex w-72 flex-col justify-center gap-1.5 rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(212,175,55,0.35)] ${
                  tier.highlight
                    ? "border-gold bg-charcoal"
                    : "border-gold/15 bg-charcoal hover:border-gold/35"
                }`}
              >
                {tier.highlight ? (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-obsidian">
                    {t("mostPopular")}
                  </span>
                ) : null}
                <span className="text-[10px] font-medium uppercase tracking-wide text-smoke">
                  {tier.label}
                  {tier.suffix ? (
                    <span className="ms-1 text-[9px] normal-case text-smoke/70">{tier.suffix}</span>
                  ) : null}
                </span>
                <span className="font-display text-xl font-bold text-gold">
                  {t("priceOnRequest")}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs italic text-smoke lg:mt-3">
            {t("includesNote")}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-smoke/70">
            {t("disclaimer")}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:mt-6">
            <CTAButton href={`/booking?vehicle=${vehicle.slug}`}>{t("bookNow")}</CTAButton>
            {/* Mobile-only — moved here from the hero block above (see the
                CTA cleanup that removed the duplicate hero buttons). */}
            <a
              href={getWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#1EBE5A] lg:hidden"
            >
              <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 shrink-0 fill-white">
                <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
              </svg>
              {t("enquireWhatsapp")}
            </a>
            {/* Desktop-only — replaces the old Get Quote button. Get Quote
                was already lg:inline-flex only, so removing it doesn't
                change mobile at all. */}
            <a
              href={getWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-14 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#1EBE5A] lg:inline-flex"
            >
              <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4 shrink-0 fill-white">
                <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
              </svg>
              {t("enquireWhatsapp")}
            </a>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-white lg:text-gold/80">
            {t("trustNote")}
          </p>
        </Reveal>
      </Container>
      </Section>

      {/* Trust stats band — desktop only, reuses the Fleet page's stats
          component as-is; sits right after Packages, matching the
          desktop flow "Features -> Packages -> trust stats -> Why
          Choose". */}
      <div className="hidden lg:block">
        <FleetTrustSection />
      </div>

      {/* Specs zone, part 2 — Features (mobile only), Why Choose, How It
          Works. */}
      <Section tone="obsidian">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Features & Amenities — mobile only now; desktop shows the
            merged 10-card Features & Amenities grid directly under the
            hero instead (see Specs zone, part 1), so this original
            section is hidden at lg to avoid showing the feature list
            twice on desktop. */}
        <div className="lg:hidden">
          <Reveal>
            <SectionHeading
              eyebrow={t("onboardEyebrow")}
              title={t("featuresTitle")}
              align="left"
              tone="dark"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.features.map((feature, index) => {
              const Icon = amenityIcon(englishFeatures[index] ?? feature);
              return (
                <Reveal key={feature} delay={Math.min(index * 70, 350)}>
                <Card
                  tone="dark"
                  interactive
                  className="flex h-full items-center gap-3 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(212,175,55,0.4)] sm:p-6"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10">
                    <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm text-smoke">{feature}</span>
                </Card>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Why choose this vehicle */}
        <div>
          <Reveal>
            <SectionHeading
              eyebrow={t("whyThisVehicleEyebrow")}
              title={t("whyChooseTitleTemplate", { name: vehicle.name })}
              align="left"
              tone="dark"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vehicle.whyChoose.map((reason, index) => (
              <Reveal key={reason} delay={Math.min(index * 80, 320)}>
              <Card
                tone="dark"
                interactive
                className="flex h-full items-start gap-3 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 sm:p-6"
              >
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-smoke">{reason}</p>
              </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* How It Works — desktop only, structural addition; explains the
            booking flow in three steps. Content is vehicle-agnostic. */}
        <div className="hidden lg:block">
          <Reveal>
            <SectionHeading
              eyebrow={t("howItWorksEyebrow")}
              title={t("howItWorksTitle")}
              align="left"
              tone="dark"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, index) => (
              <Reveal key={step.title} delay={index * 100}>
              <Card
                tone="dark"
                interactive
                className="rounded-xl p-8 text-center transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 font-display text-base text-gold">
                  {index + 1}
                </span>
                <step.icon className="mx-auto mt-5 h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-xl text-heading">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{step.description}</p>
              </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* About — light, editorial section; deliberately breaks from the
          dark specs/features block above for a premium change of pace. */}
      <Section tone="ivory">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionHeading
            eyebrow={t("vehicleEyebrow")}
            title={t("aboutTitleTemplate", { name: vehicle.name })}
            align="left"
            tone="light"
          />
          <p className="mt-6 text-base leading-relaxed text-graphite sm:text-lg">
            {vehicle.longDescription}
          </p>
        </Reveal>
      </Container>
      </Section>

      {/* Related vehicles — reuses the homepage "Our Fleet" card exactly,
          with its WhatsApp-enquiry variant enabled. */}
      <Section tone="obsidian">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t("exploreMoreEyebrow")}
            title={t("exploreSimilarTitle")}
            tone="dark"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {similarVehicles.map((related, index) => (
            <Reveal key={related.slug} delay={index * 100}>
              <FleetCarouselCard vehicle={related} labels={cardLabels} tone="dark" />
            </Reveal>
          ))}
        </div>
      </Container>
      </Section>

      {/* FAQ — dedicated accordion section, light background matching About. */}
      <VehicleFaqSection vehicleName={vehicle.name} />

      <BookingCTA />
    </div>
  );
}
