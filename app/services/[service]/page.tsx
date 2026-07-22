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
  Check,
  Star,
  ChevronDown,
  ArrowLeft,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import CTAButton from "@/components/shared/CTAButton";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
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
      "@type": "LimousineService",
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

      {/* Body zone */}
      <Section tone="ivory">
      <Container>
        {/* Long-form SEO copy */}
        <div className="max-w-3xl space-y-5">
          {service.longDescription.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-graphite sm:text-base">
              {paragraph}
            </p>
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

      {/* FAQ + related services zone */}
      <Section tone="linen">
      <Container>
        {/* FAQ — native <details>/<summary> keeps this interactive without
            a client component, so the page stays fully server-rendered. */}
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Common Questions"
            title={`${service.name} FAQs`}
            align="left"
            tone="light"
          />
          <div className="mt-8 divide-y divide-obsidian/10 border-y border-obsidian/10">
            {service.faqs.map((faq) => (
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

        {/* Related services */}
        <div className="mt-24">
          <SectionHeading eyebrow="Explore More" title="Other Services" tone="light" />
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-3">
            {otherServices.map((related) => {
              const RelatedIcon = ICONS[related.slug] ?? Crown;
              return (
                <Link
                  key={related.slug}
                  href={`/services/${related.slug}`}
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
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
      </Section>

      <BookingCTA backgroundImage={false} />
    </div>
  );
}
