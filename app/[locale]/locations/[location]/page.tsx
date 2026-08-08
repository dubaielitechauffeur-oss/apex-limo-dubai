import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  MapPin,
  Plane,
  Star,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import Card from "@/components/shared/Card";
import Reveal from "@/components/shared/Reveal";
import FleetCarousel from "@/components/home/FleetCarousel";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import TrustStats from "@/components/home/TrustStats";
import LocationServicesSection from "@/components/locations/LocationServicesSection";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import BookingCTA from "@/components/home/BookingCTA";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import RichParagraph from "@/components/services/RichParagraph";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE, PRICE_RANGE, getWhatsAppLink } from "@/lib/constants";
import { getAllLocations, getLocationBySlug } from "@/lib/public/cms-content";
import { LOCATIONS, type PlainLocation } from "@/data/locations";
import { FLEET } from "@/data/fleet";
import { vehiclesForLocation } from "@/lib/cross-links";

interface PageProps {
  params: Promise<{ locale: string; location: string }>;
}

// See app/[locale]/services/page.tsx for the revalidation strategy note.
export const revalidate = 300;

export async function generateStaticParams() {
  return LOCATIONS.map((location) => ({ location: location.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, location: slug } = await params;
  const location = await getLocationBySlug(slug, locale as Locale);
  const t = await getTranslations({ locale, namespace: "metadata.location" });

  if (!location) {
    return buildMetadata({
      locale: locale as Locale,
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      path: `/locations/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return buildMetadata({
    locale: locale as Locale,
    title: t("titleTemplate", { name: location.name }),
    description: t("descriptionTemplate", { shortDescription: location.shortDescription }),
    path: `/locations/${location.slug}`,
  });
}

/**
 * LocalBusiness JSON-LD scoped to this specific service area. Uses its own
 * unique @id (rather than reusing the root organization's) since each
 * location page asserts a different areaServed/address for what would
 * otherwise be the same node — reusing the root @id across 6 location
 * pages with conflicting properties was the cause of Search Console's
 * "Invalid object type for field 'parent_node'" Review Snippet error
 * (the review data on the homepage's LocalBusiness node was getting merged
 * with these conflicting redeclarations). `parentOrganization` links back
 * to the root business (see lib/seo.ts) without conflating the two nodes.
 * Coordinates come from `location.geo` (data/locations.ts) rather than a
 * lookup map colocated with this page, so adding a new location and its
 * coordinates is a single edit in the data model, not two files kept in
 * sync by hand.
 */
function locationJsonLd(location: PlainLocation, locale: Locale) {
  const geo = location.geo;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    inLanguage: locale,
    "additionalType": "https://schema.org/LimousineService",
    "@id": `${SITE.url}/locations/${location.slug}#localbusiness`,
    name: `${SITE.name} — ${location.name}`,
    description: location.shortDescription,
    url: `${SITE.url}${localizedPath(locale, `/locations/${location.slug}`)}`,
    telephone: SITE.phone,
    parentOrganization: {
      "@type": "LocalBusiness",
      "@id": organizationId(),
    },
    areaServed: {
      "@type": "Place",
      name: location.name,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: location.name,
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    ...(geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
        }
      : {}),
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
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { locale, location: slug } = await params;
  setRequestLocale(locale as Locale);
  const location = await getLocationBySlug(slug, locale as Locale);

  if (!location) {
    notFound();
  }

  const t = await getTranslations("locations");
  const tNav = await getTranslations("common.nav");
  const Icon = location.isAirport ? Plane : MapPin;
  const otherLocations = (await getAllLocations(locale as Locale))
    .filter((l) => l.slug !== location.slug)
    .slice(0, 3);
  const whatsappMessage = t("detail.whatsappMessage", { name: location.name });

  // Up to 3 related vehicles (previously only the first match rendered) —
  // stronger internal linking without turning this into a full grid.
  const relatedVehicleSlugs = vehiclesForLocation(location.slug).slice(0, 3);
  const relatedVehicles = relatedVehicleSlugs
    .map((slug) => FLEET.find((v) => v.slug === slug))
    .filter((v): v is (typeof FLEET)[number] => Boolean(v));

  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationJsonLd(location, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(location.faqs, locale as Locale)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tNav("locations"), path: "/locations" },
                { name: location.name, path: `/locations/${location.slug}` },
              ],
              locale as Locale,
              tNav("home")
            )
          ),
        }}
      />

      {/* Hero zone — reuses the same location.image shown on this
          location's /locations listing card, so both stay in sync.
          Locations with a heroDesktopImage and/or heroMobileImage swap in
          those images via <picture> (same pattern as the homepage Hero),
          falling back to location.image for whichever breakpoint has no
          override. Locations with neither field keep the original
          single-image behavior unchanged. */}
      <section className="relative isolate overflow-hidden bg-obsidian py-16 sm:py-20">
        <div className="absolute inset-0">
          {location.heroDesktopImage || location.heroMobileImage ? (
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={(location.heroMobileImage ?? location.image).src}
              />
              <img
                src={(location.heroDesktopImage ?? location.image).src}
                alt={(location.heroDesktopImage ?? location.image).alt}
                fetchPriority="high"
                decoding="async"
                style={{ objectPosition: location.heroObjectPosition ?? "center" }}
                className="h-full w-full object-cover"
              />
            </picture>
          ) : (
            <Image
              src={location.image.src}
              alt={location.image.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30"
        />

        <Container className="relative z-10">
          <Link
            href="/locations"
            className="inline-flex animate-fade-in items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <DirectionalIcon icon={ArrowLeft} className="h-3.5 w-3.5" strokeWidth={2} />
            {t("detail.backToLocations")}
          </Link>

          <div className="mt-8 max-w-3xl">
            <Icon className="h-9 w-9 animate-fade-in text-gold [animation-delay:100ms]" strokeWidth={1.5} />
            <span className="mt-5 block animate-fade-in label-eyebrow [animation-delay:150ms]">{location.tagline}</span>
            <h1 className="mt-4 animate-slide-in-left font-display text-3xl text-heading [animation-delay:150ms] sm:text-5xl">
              {t("detail.titleTemplate", { name: location.name })}
            </h1>
            <p className="mt-5 animate-fade-in text-sm leading-relaxed text-smoke [animation-delay:300ms] sm:text-base">
              {location.heroSubtitle}
            </p>

            <div className="mt-8 flex animate-fade-in flex-col gap-3 [animation-delay:450ms] sm:flex-row sm:flex-wrap">
              <CTAButton href={`/booking?location=${location.slug}`}>{t("detail.bookNow")}</CTAButton>
              <CTAButton href={`/quote?location=${location.slug}`} variant="outline">
                {t("detail.getQuote")}
              </CTAButton>
              <CTAButton href={getWhatsAppLink(whatsappMessage)} variant="outline" external>
                {t("detail.whatsappUs")}
              </CTAButton>
            </div>

            {relatedVehicles.length > 0 ? (
              <p className="mt-6 text-sm text-smoke">
                {t("detail.popularChoicePrefix", { name: location.name })}{" "}
                {relatedVehicles.map((vehicle, index) => (
                  <span key={vehicle.slug}>
                    <Link
                      href={`/fleet/${vehicle.slug}`}
                      className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                    >
                      {vehicle.name}
                    </Link>
                    {index < relatedVehicles.length - 1 ? (
                      index === relatedVehicles.length - 2 ? ` ${t("detail.relatedVehiclesAnd")} ` : ", "
                    ) : ""}
                  </span>
                ))}
                .
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      {/* Our Fleet — identical to the homepage fleet carousel, so visitors
          landing here from search see the available fleet immediately. */}
      <FleetCarousel />

      {/* Our Brands — identical to the homepage brand marquee. */}
      <BrandsShowcase />

      {/* Trust / Stats — identical to the homepage trust band. */}
      <TrustStats />

      {/* Location content zone */}
      <Section tone="ivory">
      <Container>
        {/* Condensed SEO copy */}
        <Reveal className="max-w-3xl space-y-5">
          {location.longDescription.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-graphite sm:text-base">
              {paragraph}
            </p>
          ))}

          {!location.isAirport ? (
            <Card tone="light" className="flex items-start gap-3 p-5">
              <Plane className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
              <RichParagraph
                text={t("detail.airportNote")}
                className="text-sm leading-relaxed text-graphite [&_a]:text-obsidian [&_a]:hover:text-gold-deep"
              />
            </Card>
          ) : null}
        </Reveal>

        {/* Why Choose Apex in this area */}
        <div className="mt-20">
          <Reveal>
            <SectionHeading
              eyebrow={t("detail.whyApexEyebrow")}
              title={t("detail.whyChooseTitleTemplate", { name: location.name })}
              align="left"
              tone="light"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {location.whyChoose.map((reason, index) => (
              <Reveal key={reason} delay={Math.min(index * 80, 320)} className="flex items-start gap-3">
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-graphite">{reason}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* Common Journeys — black luxury theme matching the FAQ Hub / Contact
          page color system (obsidian / ink / gold design tokens). */}
      <section className="border-t border-gold/15 bg-obsidian py-20 sm:py-24">
        <Container>
          <Reveal>
            <span className="label-eyebrow">{t("detail.popularRoutesEyebrow")}</span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl text-white sm:text-4xl">
              {t("detail.commonJourneysTitleTemplate", { name: location.name })}
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {location.popularRoutes.map((route, index) => (
              <Reveal
                key={`${route.from}-${route.to}`}
                delay={Math.min(index * 70, 280)}
                className="flex items-center justify-between gap-4 rounded-xl border border-gold/15 bg-obsidian-light p-6 transition-colors duration-300 hover:bg-obsidian-light"
              >
                <div className="flex items-center gap-2.5 text-sm text-white sm:text-base">
                  <span>{route.from}</span>
                  <DirectionalIcon
                    icon={ArrowRight}
                    className="h-3.5 w-3.5 shrink-0 text-gold"
                    strokeWidth={2}
                  />
                  <span>{route.to}</span>
                </div>
                <span className="shrink-0 rounded-full border border-gold/25 bg-obsidian-light px-3 py-1 text-xs uppercase tracking-wide text-smoke">
                  {route.duration}
                </span>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ — black luxury theme with a visible background photo (this
          location's own hero image) behind a moderate scrim, matching the
          FAQ Hub's accordion card styling on top. */}
      <section className="relative isolate overflow-hidden border-t border-gold/15 bg-ink py-20 sm:py-24">
        <div className="absolute inset-0">
          <Image
            src={location.image.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-obsidian/60" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/75 to-obsidian/50"
        />

        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal>
              <span className="label-eyebrow">{t("detail.commonQuestionsEyebrow")}</span>
              <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">
                {t("detail.faqTitleTemplate", { name: location.name })}
              </h2>
            </Reveal>

            {/* FAQ — native <details>/<summary> keeps this interactive
                without a client component, so the page stays fully
                server-rendered. */}
            <div className="mt-10 space-y-3">
              {location.faqs.map((faq, index) => (
                <Reveal key={faq.question} delay={Math.min(index * 60, 300)}>
                <details
                  className="group rounded-xl border border-gold/15 bg-obsidian-light/90 px-6 py-5 backdrop-blur-sm transition-colors duration-300 open:bg-obsidian-light/90"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-start font-display text-base text-white marker:content-none sm:text-lg [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-180"
                      strokeWidth={1.5}
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
                    {faq.answer}
                  </p>
                </details>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Our Services — desktop 3-per-view autoplay carousel, mobile/tablet unchanged. */}
      <LocationServicesSection />

      {/* Related locations — identical to the homepage locations showcase,
          scoped to the other areas we serve besides this one. */}
      <LocationsShowcase
        eyebrow={t("detail.exploreMoreEyebrow")}
        title={t("detail.otherAreasTitle")}
        subtitle={t("detail.otherAreasSubtitleTemplate", { siteName: SITE.name })}
        cards={otherLocations.map((related) => ({ location: related }))}
      />

      <BookingCTA />
    </div>
  );
}
