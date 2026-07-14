import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plane, ArrowUpRight } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { LOCATIONS } from "@/data/locations";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Areas We Serve in Dubai",
    description:
      "Chauffeur service across Dubai Marina, Palm Jumeirah, Downtown Dubai, Business Bay, JBR, and Dubai International Airport (DXB).",
    path: "/locations",
  });
}

/** ItemList of Place entities for the locations listing page. */
function locationsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} Service Areas`,
    url: `${SITE.url}/locations`,
    itemListElement: LOCATIONS.map((location, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Place",
        name: location.name,
        description: location.shortDescription,
      },
    })),
  };
}

export default function LocationsPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationsJsonLd()) }}
      />

      <Section tone="ivory" separator={false}>
        <Container>
          <SectionHeading
            eyebrow="Where We Drive"
            title="Areas We Serve Across Dubai"
            subtitle="From beachfront residences to the business district, Apex chauffeurs know Dubai's neighborhoods, pickup points, and traffic patterns in detail."
            tone="light"
          />

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((location) => {
              const Icon = location.isAirport ? Plane : MapPin;
              return (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group flex flex-col justify-between bg-ivory p-8 transition-colors duration-200 hover:bg-ivory-off"
                >
                  <div>
                    <Icon className="h-7 w-7 text-gold-deep" strokeWidth={1.5} />
                    <h2 className="mt-6 font-display text-xl text-obsidian">
                      {location.name}
                    </h2>
                    <p className="mt-1 text-xs italic text-graphite">{location.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">
                      {location.shortDescription}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors duration-200 group-hover:text-gold-deep">
                    Explore area
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
