import type { Metadata } from "next";
import Link from "next/link";
import {
  Plane,
  Briefcase,
  Crown,
  ShieldCheck,
  PartyPopper,
  Heart,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { SERVICES } from "@/data/services";

const ICONS: Record<string, LucideIcon> = {
  "airport-transfers": Plane,
  "corporate-chauffeur": Briefcase,
  "luxury-chauffeur": Crown,
  "vip-transportation": ShieldCheck,
  "event-transportation": PartyPopper,
  "wedding-chauffeur": Heart,
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Chauffeur Services in Dubai",
    description:
      "Airport transfers, corporate chauffeur, luxury chauffeur, VIP transportation, event transportation, and wedding chauffeur service across Dubai and the UAE.",
    path: "/services",
  });
}

/** ItemList of Service entities for the listing page. */
function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} Services`,
    url: `${SITE.url}/services`,
    itemListElement: SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.shortDescription,
        provider: {
          "@type": "LimousineService",
          name: SITE.name,
        },
        areaServed: {
          "@type": "City",
          name: "Dubai",
        },
      },
    })),
  };
}

export default function ServicesPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd()) }}
      />

      <Section tone="ivory" separator={false}>
        <Container>
          <SectionHeading
            eyebrow="What We Offer"
            title="Chauffeur Services in Dubai"
            subtitle="From a single airport pickup to a fully coordinated wedding convoy, every Apex service is built around punctuality, discretion, and a fleet that matches the occasion."
            tone="light"
          />

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.slug] ?? Crown;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col justify-between bg-ivory p-8 transition-colors duration-200 hover:bg-ivory-off"
                >
                  <div>
                    <Icon className="h-7 w-7 text-gold-deep" strokeWidth={1.5} />
                    <h2 className="mt-6 font-display text-xl text-obsidian">
                      {service.name}
                    </h2>
                    <p className="mt-1 text-xs italic text-graphite">{service.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">
                      {service.shortDescription}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors duration-200 group-hover:text-gold-deep">
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
