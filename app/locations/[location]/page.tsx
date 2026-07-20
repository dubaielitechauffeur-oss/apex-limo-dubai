import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import FleetCarousel from "@/components/home/FleetCarousel";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import TrustStats from "@/components/home/TrustStats";
import ServicesGrid from "@/components/home/ServicesGrid";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationId } from "@/lib/seo";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import { LOCATIONS } from "@/data/locations";
import { FLEET } from "@/data/fleet";
import { vehiclesForLocation } from "@/lib/cross-links";

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateStaticParams() {
  return LOCATIONS.map((location) => ({ location: location.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const location = LOCATIONS.find((l) => l.slug === slug);

  if (!location) {
    return buildMetadata({
      title: "Location Not Found",
      description: "This service area could not be found.",
      path: `/locations/${slug}`,
    });
  }

  return buildMetadata({
    title: `Chauffeur Service in ${location.name} | Dubai`,
    description: `${location.shortDescription} Book online or get an instant quote from Apex Limo & Chauffeur Dubai.`,
    path: `/locations/${location.slug}`,
  });
}

/**
 * LocalBusiness + FAQPage JSON-LD scoped to this specific service area.
 * Uses the same @id as the root LimousineService entity (see lib/seo.ts)
 * so parsers recognize this as additional area-specific data about the
 * one business, not a separate, unlinked entity per location.
 */
function locationJsonLd(location: (typeof LOCATIONS)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "LimousineService",
    "@id": organizationId(),
    name: SITE.name,
    description: location.shortDescription,
    url: SITE.url,
    telephone: SITE.phone,
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
    priceRange: "$$$",
  };
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { location: slug } = await params;
  const location = LOCATIONS.find((l) => l.slug === slug);

  if (!location) {
    notFound();
  }

  const Icon = location.isAirport ? Plane : MapPin;
  const otherLocations = LOCATIONS.filter((l) => l.slug !== location.slug).slice(0, 3);
  const whatsappMessage = `Hello Apex Limo, I'd like to book a chauffeur in ${location.name}.`;

  const relatedVehicleSlug = vehiclesForLocation(location.slug)[0];
  const relatedVehicle = relatedVehicleSlug
    ? FLEET.find((v) => v.slug === relatedVehicleSlug)
    : undefined;

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationJsonLd(location)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(location.faqs)) }}
      />

      {/* Hero zone — reuses the same location.image shown on this
          location's /locations listing card, so both stay in sync. */}
      <section className="relative isolate overflow-hidden bg-obsidian py-16 sm:py-20">
        <div className="absolute inset-0">
          <Image
            src={location.image.src}
            alt={location.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
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
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Locations
          </Link>

          <div className="mt-8 max-w-3xl">
            <Icon className="h-9 w-9 text-gold" strokeWidth={1.5} />
            <span className="mt-5 block label-eyebrow">{location.tagline}</span>
            <h1 className="mt-4 font-display text-3xl text-heading sm:text-5xl">
              Chauffeur Service in {location.name}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-smoke sm:text-base">
              {location.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href={`/booking?location=${location.slug}`}>Book Now</CTAButton>
              <CTAButton href={`/quote?location=${location.slug}`} variant="outline">
                Get Quote
              </CTAButton>
              <CTAButton href={getWhatsAppLink(whatsappMessage)} variant="outline" external>
                WhatsApp Us
              </CTAButton>
            </div>

            {relatedVehicle ? (
              <p className="mt-6 text-sm text-smoke">
                A popular choice in {location.name}:{" "}
                <Link
                  href={`/fleet/${relatedVehicle.slug}`}
                  className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
                >
                  {relatedVehicle.name}
                </Link>
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
        <div className="max-w-3xl space-y-5">
          {location.longDescription.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-graphite sm:text-base">
              {paragraph}
            </p>
          ))}

          {!location.isAirport ? (
            <Card tone="light" className="flex items-start gap-3 p-5">
              <Plane className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-graphite">
                Traveling to or from the airport?{" "}
                <Link
                  href="/services/airport-transfers"
                  className="text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
                >
                  See our Airport Transfer service
                </Link>{" "}
                for flight tracking and meet-and-greet details.
              </p>
            </Card>
          ) : null}
        </div>

        {/* Why Choose Apex in this area */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Why Apex"
            title={`Why Choose Apex in ${location.name}`}
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {location.whyChoose.map((reason) => (
              <div key={reason} className="flex items-start gap-3">
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-graphite">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* Common Journeys — black luxury theme matching the FAQ Hub / Contact
          page color system (#0A0A0A / #111111 / #C9A14A). */}
      <section className="border-t border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
        <Container>
          <span className="label-eyebrow">Popular Routes</span>
          <h2 className="mt-4 max-w-2xl font-display text-3xl text-white sm:text-4xl">
            Common Journeys From {location.name}
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {location.popularRoutes.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(201,161,74,0.15)] bg-[#121212] p-6 transition-colors duration-300 hover:bg-[#171717]"
              >
                <div className="flex items-center gap-2.5 text-sm text-white sm:text-base">
                  <span>{route.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#C9A14A]" strokeWidth={2} />
                  <span>{route.to}</span>
                </div>
                <span className="shrink-0 rounded-full border border-[rgba(201,161,74,0.25)] bg-[#151515] px-3 py-1 text-xs uppercase tracking-wide text-[#B8B8B8]">
                  {route.duration}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ — black luxury theme with a visible background photo (this
          location's own hero image) behind a moderate scrim, matching the
          FAQ Hub's accordion card styling on top. */}
      <section className="relative isolate overflow-hidden border-t border-[rgba(201,161,74,0.15)] bg-[#111111] py-20 sm:py-24">
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
        <div aria-hidden="true" className="absolute inset-0 bg-[#0A0A0A]/60" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/75 to-[#0A0A0A]/50"
        />

        <Container className="relative">
          <div className="max-w-3xl">
            <span className="label-eyebrow">Common Questions</span>
            <h2 className="mt-4 font-display text-3xl text-white sm:text-4xl">
              {location.name} FAQs
            </h2>

            {/* FAQ — native <details>/<summary> keeps this interactive
                without a client component, so the page stays fully
                server-rendered. */}
            <div className="mt-10 space-y-3">
              {location.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-[rgba(201,161,74,0.15)] bg-[#121212]/90 px-6 py-5 backdrop-blur-sm transition-colors duration-300 open:bg-[#171717]/90"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-base text-white marker:content-none sm:text-lg [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-[#C9A14A] transition-transform duration-200 group-open:rotate-180"
                      strokeWidth={1.5}
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Other Services — identical to the homepage services showcase. */}
      <ServicesGrid />

      {/* Related locations — identical to the homepage locations showcase,
          scoped to the other areas we serve besides this one. */}
      <LocationsShowcase
        eyebrow="Explore More"
        title="Other Areas We Serve"
        subtitle={`Chauffeur service is also available across these nearby ${SITE.name} destinations.`}
        cards={otherLocations.map((related) => ({ location: related }))}
      />

      <BookingCTA />
    </div>
  );
}
