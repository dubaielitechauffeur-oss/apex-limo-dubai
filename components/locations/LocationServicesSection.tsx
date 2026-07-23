import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import LocationServiceCard from "./LocationServiceCard";
import LocationServicesCarousel from "./LocationServicesCarousel";
import { SERVICES } from "@/data/services";

/**
 * "Our Services" section for dynamic location pages. Mobile (native
 * scroll-snap swipe row) and tablet (2-up grid) are byte-identical to the
 * homepage ServicesGrid's responsive behavior below the `lg` breakpoint —
 * intentionally untouched. At `lg` and above, the previous "all 6 cards in
 * one 3-column grid" layout (unnecessary page height) is replaced with a
 * paginated 3-per-view carousel — see LocationServicesCarousel.
 */
export default function LocationServicesSection() {
  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <SectionHeading
          eyebrow="What We Offer"
          title="Our Services"
          subtitle="From airport transfers to VIP transportation, every journey is planned and delivered to the highest standard."
          tone="light"
        />

        {/* Mobile + tablet — unchanged scroll-snap / 2-up grid */}
        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:hidden">
          {SERVICES.map((service) => (
            <LocationServiceCard
              key={service.slug}
              service={service}
              className="w-[82%] shrink-0 snap-center sm:w-auto sm:shrink"
            />
          ))}
        </div>

        {/* Desktop — paginated carousel */}
        <div className="mt-16 hidden lg:block">
          <LocationServicesCarousel />
        </div>
      </Container>
    </section>
  );
}
