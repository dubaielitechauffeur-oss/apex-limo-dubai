import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import QuoteForm from "@/components/booking/QuoteForm";
import ConversionPageIntro from "@/components/booking/ConversionPageIntro";
import ConversionSeoIntro from "@/components/booking/ConversionSeoIntro";
import ConversionTrustPanel from "@/components/booking/ConversionTrustPanel";
import VehicleSummaryCardClient from "@/components/booking/VehicleSummaryCardClient";
import { getAllVehicles } from "@/data/fleet";
import { getAllServices } from "@/data/services";
import { getAllLocations } from "@/data/locations";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getSiteContact } from "@/lib/public/site-contact";

interface QuotePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.quote" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/quote",
  });
}

export default async function QuotePage({ params }: QuotePageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "forms" });
  const tNav = await getTranslations({ locale, namespace: "common.nav" });
  const tSummary = await getTranslations({ locale, namespace: "fleet.summaryCard" });
  const services = getAllServices(locale as Locale).map(({ slug, name }) => ({ slug, name }));
  const locations = getAllLocations(locale as Locale).map(({ slug, name }) => ({ slug, name }));
  const allVehicles = getAllVehicles(locale as Locale);
  const vehicles = allVehicles.map(({ slug, name, category }) => ({ slug, name, category }));
  // Slim, already-localized subset for VehicleSummaryCardClient — deliberately
  // excludes longDescription/features/whyChoose/faqs/full gallery so the
  // client bundle doesn't ship every locale's full fleet content, same
  // reasoning as the `vehicles` trim above for QuoteForm.
  const vehicleSummaries = allVehicles.map(({ slug, name, brand, description, passengers, luggage, images }) => ({
    slug,
    name,
    brand,
    description,
    passengers,
    luggage,
    cover: images?.[0],
  }));
  const summaryLabels = {
    passengers: tSummary("passengers"),
    luggage: tSummary("luggage"),
    chauffeurIncluded: tSummary("chauffeurIncluded"),
  };
  const contact = await getSiteContact();

  return (
    <>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: t("quote.breadcrumbLabel"), path: "/quote" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      <ConversionPageIntro
        heading={t("quote.pageHeading")}
        description={t("conversion.sharedDescription")}
      />

      <ConversionSeoIntro>
        {t("quote.seoIntro")}
      </ConversionSeoIntro>

      <section className="bg-obsidian pb-20 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
            <div className="rounded-2xl border border-gold/15 bg-ink p-6 sm:p-8 lg:p-10">
              <Suspense fallback={null}>
                <VehicleSummaryCardClient vehicles={vehicleSummaries} labels={summaryLabels} />
              </Suspense>
              <QuoteForm services={services} locations={locations} vehicles={vehicles} contact={contact} />
            </div>

            <aside>
              <div className="sticky top-28">
                <ConversionTrustPanel />
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
