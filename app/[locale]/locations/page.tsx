import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MapPin, Plane } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import BookingCTA from "@/components/home/BookingCTA";
import LocationsHero from "@/components/locations/LocationsHero";
import { buildMetadata, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { getAllLocations } from "@/lib/public/cms-content";
import type { PlainLocation } from "@/data/locations";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// See app/[locale]/services/page.tsx for the revalidation strategy note.
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.locations" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/locations",
  });
}

/** ItemList of Place entities for the locations listing page. */
function locationsJsonLd(locale: Locale, locations: PlainLocation[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: locale,
    name: `${SITE.name} Service Areas`,
    url: `${SITE.url}${localizedPath(locale, "/locations")}`,
    itemListElement: locations.map((location, index) => ({
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

export default async function LocationsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("locations");
  const tNav = await getTranslations("common.nav");
  const locations = await getAllLocations(locale as Locale);
  return (
    <div>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationsJsonLd(locale as Locale, locations)) }}
      />
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: tNav("locations"), path: "/locations" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      <LocationsHero />

      <Section tone="ivory" separator={false}>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t("listing.eyebrow")}
              title={t("listing.title")}
              subtitle={t("listing.subtitle")}
              tone="light"
            />
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, index) => {
              const Icon = location.isAirport ? Plane : MapPin;
              return (
                <Reveal key={location.slug} delay={Math.min(index * 60, 300)}>
                <Link
                  href={`/locations/${location.slug}`}
                  className="group flex flex-col bg-ivory transition-colors duration-200 hover:bg-ivory-off"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-sm">
                    <Image
                      src={location.image.src}
                      alt={location.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-8">
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
                    <span className="btn-gold mt-8 w-fit">{t("listing.exploreArea")}</span>
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <BookingCTA />
    </div>
  );
}
