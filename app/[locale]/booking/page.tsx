import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import BookingForm from "@/components/booking/BookingForm";
import ConversionPageIntro from "@/components/booking/ConversionPageIntro";
import ConversionSeoIntro from "@/components/booking/ConversionSeoIntro";
import ConversionTrustPanel from "@/components/booking/ConversionTrustPanel";
import { getAllServices } from "@/data/services";
import { getAllLocations } from "@/data/locations";
import { getAllVehicles } from "@/data/fleet";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.booking" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/booking",
  });
}

export default async function BookingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "forms" });
  const tNav = await getTranslations({ locale, namespace: "common.nav" });
  const services = getAllServices(locale as Locale).map(({ slug, name }) => ({ slug, name }));
  const locations = getAllLocations(locale as Locale).map(({ slug, name }) => ({ slug, name }));
  const vehicles = getAllVehicles(locale as Locale).map(({ slug, name, category }) => ({ slug, name, category }));
  return (
    <>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: t("booking.breadcrumbLabel"), path: "/booking" }], locale as Locale, tNav("home"))
          ),
        }}
      />

      <ConversionPageIntro
        heading={t("booking.pageHeading")}
        description={t("conversion.sharedDescription")}
      />

      <ConversionSeoIntro>
        {t("booking.seoIntro")}
      </ConversionSeoIntro>

      <section className="bg-obsidian pb-20 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
            <div className="rounded-2xl border border-gold/15 bg-ink p-6 sm:p-8 lg:p-10">
              <BookingForm services={services} locations={locations} vehicles={vehicles} />
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
