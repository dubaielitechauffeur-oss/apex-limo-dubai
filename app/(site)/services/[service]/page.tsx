import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane,
  Briefcase,
  Crown,
  ShieldCheck,
  PartyPopper,
  Heart,
  Users,
  TrendingUp,
  Check,
  Star,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import BookingCTA from "@/components/home/BookingCTA";
import FleetCarousel from "@/components/home/FleetCarousel";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import RichParagraph from "@/components/services/RichParagraph";
import ServiceRatingSection from "@/components/services/ServiceRatingSection";
import OtherServicesGrid from "@/components/services/OtherServicesGrid";
import CoverageBlock from "@/components/shared/CoverageBlock";
import ServiceFaqSection from "@/components/services/ServiceFaqSection";
import { buildMetadata, faqJsonLd, organizationId, breadcrumbJsonLd } from "@/lib/seo";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import { SERVICES } from "@/data/services";
import { FLEET } from "@/data/fleet";
import { vehiclesForService } from "@/lib/cross-links";

interface PageProps {
  params: Promise<{ service: string }>;
}

const ICONS: Record<string, LucideIcon> = {
  "airport-transfers": Plane,
  "corporate-chauffeur": Briefcase,
  "luxury-chauffeur": Crown,
  "vip-transportation": ShieldCheck,
  "event-transportation": PartyPopper,
  "wedding-chauffeur": Heart,
};

/** Icon shown next to each service's contextual rating metric — keyed by
 *  the metric's label so data/services.ts can stay plain data. */
const METRIC_ICONS: Record<string, LucideIcon> = {
  "Happy Clients": Users,
  "Airport Transfers": Plane,
  "Corporate Clients": Briefcase,
  "VIP Transfers": ShieldCheck,
  "Executive Journeys": TrendingUp,
};

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return buildMetadata({
      title: "Service Not Found",
      description: "This service could not be found.",
      path: `/services/${slug}`,
    });
  }

  return buildMetadata({
    title: `${service.name} in Dubai`,
    description: `${service.shortDescription} Book online or get an instant quote from Apex Limo & Chauffeur Dubai.`,
    path: `/services/${service.slug}`,
  });
}

/** Service + FAQPage JSON-LD for this specific service. */
function serviceJsonLd(service: (typeof SERVICES)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription,
    url: `${SITE.url}/services/${service.slug}`,
    serviceType: service.name,
    provider: {
      "@type": "LocalBusiness",
      "additionalType": "https://schema.org/LimousineService",
      "@id": organizationId(),
      name: SITE.name,
      url: SITE.url,
      telephone: SITE.phone,
    },
    areaServed: {
      "@type": "City",
      name: "Dubai",
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { service: slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const Icon = ICONS[service.slug] ?? Crown;
  const MetricIcon = METRIC_ICONS[service.ratingMetric.label] ?? Users;
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);
  const whatsappMessage = `Hello Apex Limo, I'd like to enquire about ${service.name}.`;

  const relatedVehicleSlug = vehiclesForService(service.slug)[0];
  const relatedVehicle = relatedVehicleSlug
    ? FLEET.find((v) => v.slug === relatedVehicleSlug)
    : undefined;

  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(service)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(service.faqs)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Services", path: "/services" },
              { name: service.name, path: `/services/${service.slug}` },
            ])
          ),
        }}
      />

      {/* Hero zone — reuses the same service.image shown on this service's
          /services listing card, so both stay in sync automatically. */}
      <section className="relative isolate overflow-hidden bg-obsidian py-16 sm:py-20">
        <div className="absolute inset-0">
          <Image
            src={service.image.src}
            alt={service.image.alt}
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
            href="/services"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-smoke transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to Services
          </Link>

          <div className="mt-8 max-w-3xl">
            <Icon className="h-9 w-9 text-gold" strokeWidth={1.5} />
            <span className="mt-5 block label-eyebrow">{service.tagline}</span>
            <h1 className="mt-4 font-display text-3xl text-heading sm:text-5xl">
              {service.name} in Dubai
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-smoke sm:text-base">
              {service.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href={`/booking?service=${service.slug}`}>Book Now</CTAButton>
              <CTAButton href={`/quote?service=${service.slug}`} variant="outline">
                Get Quote
              </CTAButton>
              <CTAButton href={getWhatsAppLink(whatsappMessage)} variant="outline" external>
                WhatsApp Us
              </CTAButton>
            </div>

            {relatedVehicle ? (
              <p className="mt-6 text-sm text-smoke">
                Popular choice for this service:{" "}
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

      {/* Fleet discovery — same carousel component and copy as the homepage */}
      <FleetCarousel />

      {/* Our Brands — identical to the homepage section */}
      <BrandsShowcase />

      {/* Happy Clients / Rating — homepage rating style, with a metric
          contextual to this service */}
      <ServiceRatingSection
        title={`Why ${service.name} Clients Choose Apex`}
        metricIcon={MetricIcon}
        metricValue={service.ratingMetric.value}
        metricLabel={service.ratingMetric.label}
      />

      {/* Service content zone */}
      <Section tone="ivory">
      <Container>
        {/* Long-form SEO copy, shortened, with natural internal links */}
        <div className="max-w-3xl space-y-5">
          {service.longDescription.map((paragraph, index) => (
            <RichParagraph key={index} text={paragraph} />
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-20">
          <SectionHeading eyebrow="Benefits" title="What's Included" align="left" tone="light" />
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-graphite">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={2} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Why Choose Apex */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Why Apex"
            title={`Why Choose Apex for ${service.name}`}
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {service.whyChoose.map((reason) => (
              <div key={reason} className="flex items-start gap-3">
                <Star className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                <p className="text-sm leading-relaxed text-graphite">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
      </Section>

      {/* Other Services — homepage-style cards, desktop 3-up / mobile swipe */}
      <OtherServicesGrid services={otherServices} />

      {/* Compact service-area coverage strip, before the FAQ */}
      <CoverageBlock />

      {/* FAQ — redesigned to match the FAQ Hub's premium dark presentation */}
      <ServiceFaqSection
        faqs={service.faqs}
        title={`${service.name} FAQs`}
        subtitle="Answers to the questions we hear most about this service."
      />

      <BookingCTA backgroundImage={false} />
    </div>
  );
}
