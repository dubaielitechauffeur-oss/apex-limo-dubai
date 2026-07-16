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
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import Card from "@/components/shared/Card";
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

      {/* Body zone */}
      <Section tone="ivory">
      <Container>
        {/* Long-form SEO copy */}
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

        {/* Popular routes */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Popular Routes"
            title={`Common Journeys From ${location.name}`}
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {location.popularRoutes.map((route) => (
              <Card
                key={`${route.from}-${route.to}`}
                tone="light"
                className="flex items-center justify-between gap-4 p-5"
              >
                <div className="flex items-center gap-2 text-sm text-obsidian">
                  <span>{route.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gold-deep" strokeWidth={2} />
                  <span>{route.to}</span>
                </div>
                <span className="shrink-0 text-xs uppercase tracking-wide text-graphite">
                  {route.duration}
                </span>
              </Card>
            ))}
          </div>
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

      {/* FAQ + related locations zone */}
      <Section tone="linen">
      <Container>
        {/* FAQ — native <details>/<summary> keeps this interactive without
            a client component, so the page stays fully server-rendered. */}
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Common Questions"
            title={`${location.name} FAQs`}
            align="left"
            tone="light"
          />
          <div className="mt-8 divide-y divide-obsidian/10 border-y border-obsidian/10">
            {location.faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-lg text-obsidian marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-gold-deep transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={1.5}
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Related locations */}
        <div className="mt-24">
          <SectionHeading eyebrow="Explore More" title="Other Areas We Serve" tone="light" />
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-3">
            {otherLocations.map((related) => {
              const RelatedIcon = related.isAirport ? Plane : MapPin;
              return (
                <Link
                  key={related.slug}
                  href={`/locations/${related.slug}`}
                  className="group flex flex-col justify-between bg-ivory p-7 transition-colors duration-200 hover:bg-ivory-off"
                >
                  <div>
                    <RelatedIcon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
                    <h3 className="mt-4 font-display text-lg text-obsidian">
                      {related.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-graphite">
                      {related.shortDescription}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors duration-200 group-hover:text-gold-deep">
                    Explore area
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
