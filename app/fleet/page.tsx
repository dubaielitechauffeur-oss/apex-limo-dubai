import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import FleetListingCard from "@/components/fleet/FleetListingCard";
import FleetTrustSection from "@/components/fleet/FleetTrustSection";
import FleetConciergeSection from "@/components/fleet/FleetConciergeSection";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import CoverageBlock from "@/components/shared/CoverageBlock";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, organizationId, breadcrumbJsonLd } from "@/lib/seo";
import { SITE, FLEET_SIZE } from "@/lib/constants";
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

      {/* Hero */}
      <Section tone="ivory" separator={false}>
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="The Apex Fleet"
            title={`${FLEET_SIZE} Luxury Vehicles, Every Occasion Covered`}
            subtitle="From a discreet airport transfer to a Rolls-Royce wedding entrance, every vehicle in our Dubai fleet is late-model, meticulously maintained, and matched with a professionally trained chauffeur."
            tone="light"
          />
        </Container>
      </Section>

      {/* Our Brands — identical to the homepage section */}
      <BrandsShowcase />

      {/* ★★★★★ 4.9 trust band */}
      <FleetTrustSection />

      {/* Fleet listings */}
      <Section tone="ivory">
        <Container>
          <div className="flex flex-col gap-8">
            {FLEET.map((vehicle) => (
              <FleetListingCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Compact fleet coverage strip */}
      <CoverageBlock />

      {/* Short, SEO-friendly supporting copy */}
      <Section tone="ivory">
        <Container>
          <div className="mx-auto max-w-3xl text-sm leading-relaxed text-graphite">
            <h2 className="font-display text-2xl text-obsidian">
              Choosing the Right Chauffeur-Driven Vehicle in Dubai
            </h2>
            <p className="mt-4">
              For airport transfers and business travel, the Mercedes S-Class
              and BMW 7 Series deliver a quiet, discreet ride. Groups and event
              organizers typically choose the Mercedes V-Class for its seating
              and luggage capacity, while the Cadillac Escalade and Range Rover
              Autobiography suit VIP guests who want a taller, more commanding
              ride. For weddings and once-in-a-lifetime occasions, the
              Rolls-Royce Phantom remains the definitive choice across Dubai.
            </p>
            <p className="mt-4">
              Every booking includes a professional, licensed chauffeur and
              transparent, fixed pricing confirmed before you travel.
            </p>
          </div>
        </Container>
      </Section>

      {/* Fleet Concierge — helps undecided visitors pick a vehicle */}
      <FleetConciergeSection />

      <BookingCTA />
    </div>
  );
}
