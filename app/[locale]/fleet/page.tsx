import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Reveal from "@/components/shared/Reveal";
import FleetHero from "@/components/fleet/FleetHero";
import FleetListingCard from "@/components/fleet/FleetListingCard";
import FleetTrustSection from "@/components/fleet/FleetTrustSection";
import FleetConciergeSection from "@/components/fleet/FleetConciergeSection";
import CoverageBlock from "@/components/shared/CoverageBlock";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, organizationId, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { getAllVehicles } from "@/data/fleet";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.fleet" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/fleet",
  });
}

/**
 * Structured data for the fleet listing — an ItemList of Car entities,
 * giving search engines machine-readable specs for each vehicle.
 */
function fleetJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} Fleet`,
    url: `${SITE.url}${localizedPath(locale, "/fleet")}`,
    itemListElement: getAllVehicles(locale).map((vehicle, index) => ({
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

export default async function FleetPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const vehicles = getAllVehicles(locale as Locale);
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fleetJsonLd(locale as Locale)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Fleet", path: "/fleet" }], locale as Locale)
          ),
        }}
      />

      {/* Hero — luxury showroom moment, full fleet lineup photograph */}
      <FleetHero />

      {/* All vehicles — reached immediately after the hero, no sections in between */}
      <Section id="fleet-listings" tone="ivory">
        <Container>
          <div className="flex flex-col gap-8">
            {vehicles.map((vehicle, index) => (
              <Reveal key={vehicle.slug} delay={Math.min(index * 60, 300)}>
                <FleetListingCard vehicle={vehicle} />
              </Reveal>
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
