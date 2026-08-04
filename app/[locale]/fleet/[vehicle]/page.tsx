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
import VehicleHeroGallery, { VehicleGalleryCarousel } from "@/components/fleet/VehicleHeroGallery";
import VehicleHeroQuoteForm from "@/components/fleet/VehicleHeroQuoteForm";
import VehicleFaqSection from "@/components/fleet/VehicleFaqSection";
import FleetTrustSection from "@/components/fleet/FleetTrustSection";
import FleetCarouselCard from "@/components/home/FleetCarouselCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE, RATING, getWhatsAppLink } from "@/lib/constants";
import { FLEET, getAllVehicles, getVehicleBySlug, type PlainFleetVehicle } from "@/data/fleet";
import { getServiceBySlug } from "@/data/services";
import { getLocationBySlug } from "@/data/locations";
import { VEHICLE_CROSS_LINKS } from "@/lib/cross-links";

interface PageProps {
  params: Promise<{ locale: string; vehicle: string }>;
}

export async function generateStaticParams() {
  return FLEET.map((vehicle) => ({ vehicle: vehicle.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, vehicle: slug } = await params;
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

export default async function VehicleDetailPage({ params }: PageProps) {
  const { locale, vehicle: slug } = await params;
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
    contactUs: tCard("contactUs"),
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

  const priceTierLabels = [
    t("oneHour"),
    t("airportTransfer"),
    t("fiveHours"),
    t("tenHours"),
    t("additionalHour"),
    t("additionalCity"),
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
              (Book Now / Get Quote / Enquire on WhatsApp), not duplicated
              here. Desktop's equivalent content now lives in the
              two-column block below instead. */}
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

      {/* Specs zone, part 1 — Quick Facts + Pricing. Split into two Sections
          around the trust stats band below (desktop only) so its order
          matches "At a Glance -> Packages -> trust stats -> Features" flow;
          mobile never sees the stats band regardless of this split. */}
      <Section tone="obsidian" className="!pt-8 lg:!pt-24">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Quick Facts — desktop only, unchanged from before (avoids
            duplicating the passengers/luggage/Best For already shown in
            the hero meta row on mobile). */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-5">
          {quickFacts.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 80}>
            <Card
              tone="dark"
              interactive
              className="p-6 transition-all duration-200 hover:-translate-y-0.5"
            >
              <fact.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
              <p className="mt-3 text-[10px] uppercase tracking-wide text-smoke">
                {fact.label}
              </p>
              <p className="mt-1 font-display text-lg text-heading">{fact.value}</p>
            </Card>
            </Reveal>
          ))}
        </div>

        {/* Pricing */}
        <Reveal>
          <h2 className="font-display text-2xl text-heading sm:text-3xl">
            {t("availablePackages")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
            {t("packagesSubtitle")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-gold/15 bg-charcoal px-6 py-6 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.9)] sm:grid-cols-3 lg:mt-6 lg:gap-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {priceTierLabels.map((label) => (
              <div
                key={label}
                className="flex flex-col gap-1 lg:gap-2 lg:rounded-xl lg:border lg:border-gold/15 lg:bg-charcoal lg:p-5 lg:transition-all lg:duration-200 lg:hover:-translate-y-0.5 lg:hover:border-gold/35 lg:hover:shadow-[0_12px_30px_-18px_rgba(212,175,55,0.35)]"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-smoke">
                  {label}
                </span>
                <span className="font-display text-lg font-bold text-gold">
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
            <CTAButton
              href={`/quote?vehicle=${vehicle.slug}`}
              variant="outline"
              className="hidden lg:inline-flex"
            >
              {t("getQuote")}
            </CTAButton>
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
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-white lg:text-gold/80">
            {t("trustNote")}
          </p>
        </Reveal>
      </Container>
      </Section>

      {/* Trust stats band — desktop only, reuses the Fleet page's stats
          component as-is; sits between Packages and Features so the flow
          matches "At a Glance -> Packages -> trust stats -> Features". */}
      <div className="hidden lg:block">
        <FleetTrustSection />
      </div>

      {/* Specs zone, part 2 — Features, Why Choose, How It Works. */}
      <Section tone="obsidian">
      <Container className="flex flex-col gap-16 sm:gap-20">
        {/* Features & Amenities */}
        <div>
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
              <FleetCarouselCard vehicle={related} labels={cardLabels} whatsapp tone="dark" />
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
