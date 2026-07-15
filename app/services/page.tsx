import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Plane,
  Briefcase,
  Crown,
  ShieldCheck,
  PartyPopper,
  Heart,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import FAQAccordion from "@/components/shared/FAQAccordion";
import ServicesHero from "@/components/services/ServicesHero";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata } from "@/lib/seo";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import { SERVICES } from "@/data/services";
import { SERVICES_FAQS } from "@/data/servicesFaqs";

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

      <ServicesHero />

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
              const whatsappHref = getWhatsAppLink(
                `Hi, I'm interested in ${service.name}.`
              );
              return (
                <div
                  key={service.slug}
                  className="group flex flex-col bg-ivory transition-colors duration-200 hover:bg-ivory-off"
                >
                  <Link href={`/services/${service.slug}`} className="flex flex-1 flex-col">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-sm">
                      <Image
                        src={service.image.src}
                        alt={service.image.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-8 pb-0">
                      <Icon className="h-7 w-7 text-gold-deep" strokeWidth={1.5} />
                      <h2 className="mt-6 font-display text-xl text-obsidian">
                        {service.name}
                      </h2>
                      <p className="mt-1 text-xs italic text-graphite">{service.tagline}</p>
                      <p className="mt-3 text-sm leading-relaxed text-graphite">
                        {service.shortDescription}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 p-8 pt-8">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex flex-1 items-center justify-center rounded-sm bg-gold px-5 py-3 text-xs font-bold uppercase tracking-wide text-obsidian transition-colors duration-200 hover:bg-gold-deep"
                    >
                      Learn More
                    </Link>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp us about ${service.name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#25D366] transition-transform duration-200 hover:scale-105"
                    >
                      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5 fill-white">
                        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <FAQAccordion
        faqs={SERVICES_FAQS}
        eyebrow="Good to Know"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about booking, pricing, and what to expect from an Apex chauffeur service."
      />

      <BookingCTA />
    </div>
  );
}
