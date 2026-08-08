import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
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
import { getAllVehicles } from "@/lib/public/cms-content";
import { FLEET_CATEGORY_SLUGS } from "@/data/fleet";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// See app/[locale]/services/page.tsx for the revalidation strategy note.
export const revalidate = 300;

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
function fleetJsonLd(locale: Locale, vehicles: Awaited<ReturnType<typeof getAllVehicles>>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: locale,
    name: `${SITE.name} Fleet`,
    url: `${SITE.url}${localizedPath(locale, "/fleet")}`,
    itemListElement: vehicles.map((vehicle, index) => ({
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
  const tNav = await getTranslations("common.nav");
  const tCategory = await getTranslations("fleet.categoryPage");
  const vehicles = await getAllVehicles(locale as Locale);
  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(fleetJsonLd(locale as Locale, vehicles)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: tNav("fleet"), path: "/fleet" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      {/* Hero — luxury showroom moment, full fleet lineup photograph */}
      <FleetHero />

      {/* Category quick-links — Sedan/SUV/Van/Electric, internal linking
          into the new category listing pages. */}
      <Section tone="ivory" padding="sm" className="!py-8">
        <Container>
          <nav aria-label={tCategory("browseByCategory")} className="flex flex-wrap items-center justify-center gap-3">
            {FLEET_CATEGORY_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/fleet/${slug}`}
                className="rounded-full border border-gold-deep/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-gold-deep transition-colors duration-200 hover:bg-gold/10"
              >
                {tCategory(`labels.${slug}`)}
              </Link>
            ))}
          </nav>
        </Container>
      </Section>

      {/* All vehicles — reached immediately after the hero, no sections in between */}
      <Section id="fleet-listings" tone="ivory" separator={false}>
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
