import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import LocationServiceCard from "./LocationServiceCard";
import LocationServicesCarousel from "./LocationServicesCarousel";
import { getAllServices } from "@/data/services";
import type { Locale } from "@/i18n/routing";

/**
 * "Our Services" section for dynamic location pages. Mobile (native
 * scroll-snap swipe row) and tablet (2-up grid) are byte-identical to the
 * homepage ServicesGrid's responsive behavior below the `lg` breakpoint —
 * intentionally untouched. At `lg` and above, the previous "all 6 cards in
 * one 3-column grid" layout (unnecessary page height) is replaced with a
 * paginated 3-per-view carousel — see LocationServicesCarousel.
 */
export default async function LocationServicesSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("services");
  const services = getAllServices(locale);

  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t("grid.eyebrow")}
            title={t("grid.title")}
            subtitle={t("grid.subtitle")}
            tone="light"
          />
        </Reveal>

        {/* Mobile + tablet — unchanged scroll-snap / 2-up grid */}
        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:hidden">
          {services.map((service, index) => (
            <Reveal
              key={service.slug}
              delay={Math.min(index * 80, 320)}
              className="w-[82%] shrink-0 snap-center sm:w-auto sm:shrink"
            >
              <LocationServiceCard service={service} learnMoreLabel={t("learnMore")} className="w-full" />
            </Reveal>
          ))}
        </div>

        {/* Desktop — paginated carousel */}
        <div className="mt-16 hidden lg:block">
          <LocationServicesCarousel services={services} learnMoreLabel={t("learnMore")} />
        </div>
      </Container>
    </section>
  );
}
