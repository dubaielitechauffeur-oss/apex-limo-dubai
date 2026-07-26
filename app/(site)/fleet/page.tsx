import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import FleetHero from "@/components/fleet/FleetHero";
import FleetListingCard from "@/components/fleet/FleetListingCard";
import FleetTrustSection from "@/components/fleet/FleetTrustSection";
import FleetConciergeSection from "@/components/fleet/FleetConciergeSection";
import CoverageBlock from "@/components/shared/CoverageBlock";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, organizationId, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { FLEET } from "@/data/fleet";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Luxury Fleet | Mercedes, BMW, Range Rover & Rolls-Royce Phantom",
    description:
      "Explore the Apex Limo Dubai fleet: Mercedes S-Class, Mercedes V-Class, BMW 7 Series, Cadillac Escalade, Range Rover Autobiography, and Rolls-Royce Phantom. Book online or get an instant quote.",
    path: "/fleet",
  });
}

/**
 * Structured data for the fleet listing — an ItemList of Car entities,
 * giving search engines machine-readable specs for each vehicle.
 */
function fleetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} Fleet`,
    url: `${SITE.url}/fleet`,
    itemListElement: FLEET.map((vehicle, index) => ({
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

export default function FleetPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fleetJsonLd()) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Fleet", path: "/fleet" }])),
        }}
      />

      {/* Hero — luxury showroom moment, full fleet lineup photograph */}
      <FleetHero />

      {/* All vehicles — reached immediately after the hero, no sections in between */}
      <Section id="fleet-listings" tone="ivory">
        <Container>
          <div className="flex flex-col gap-8">
            {FLEET.map((vehicle) => (
              <FleetListingCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ★★★★★ 4.9 trust band — moved below the full vehicle listing */}
      <FleetTrustSection />

      {/* Compact fleet coverage strip */}
      <CoverageBlock />

      {/* Fleet Concierge — helps undecided visitors pick a vehicle */}
      <FleetConciergeSection />

      <BookingCTA />
    </div>
  );
}
