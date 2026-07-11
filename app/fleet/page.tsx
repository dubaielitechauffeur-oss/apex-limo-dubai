import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import VehicleCard from "@/components/fleet/VehicleCard";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata } from "@/lib/seo";
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
          "@type": "LimousineService",
          name: SITE.name,
        },
      },
    })),
  };
}

export default function FleetPage() {
  return (
    <div className="py-16 sm:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fleetJsonLd()) }}
      />

      <Container>
        <SectionHeading
          eyebrow="The Apex Fleet"
          title="Six Vehicles, Every Occasion Covered"
          subtitle="From a discreet airport transfer to a Rolls-Royce wedding entrance, every vehicle in our Dubai fleet is late-model, meticulously maintained, and matched with a professionally trained chauffeur."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FLEET.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>

        {/* SEO-friendly supporting copy */}
        <div className="mx-auto mt-20 max-w-3xl border-t border-gold/15 pt-12 text-sm leading-relaxed text-smoke">
          <h2 className="font-display text-2xl text-ivory">
            Choosing the Right Chauffeur-Driven Vehicle in Dubai
          </h2>
          <p className="mt-4">
            For airport transfers and business travel, the Mercedes S-Class
            and BMW 7 Series deliver a quiet, dependable ride with the
            discretion executives expect. Groups and event organizers
            typically choose the Mercedes V-Class for its combined seating
            and luggage capacity, while the Cadillac Escalade and Range Rover
            Autobiography suit VIP guests who want a taller, more commanding
            ride. For weddings and once-in-a-lifetime occasions, the
            Rolls-Royce Phantom remains the definitive choice across Dubai.
          </p>
          <p className="mt-4">
            Every booking includes a professional, licensed chauffeur, live
            flight tracking on airport transfers, and transparent, fixed
            pricing confirmed before you travel.
          </p>
        </div>
      </Container>

      <div className="mt-24">
        <BookingCTA />
      </div>
    </div>
  );
}
