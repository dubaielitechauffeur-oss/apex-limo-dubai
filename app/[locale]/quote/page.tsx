import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import QuoteForm from "@/components/booking/QuoteForm";
import ConversionPageIntro from "@/components/booking/ConversionPageIntro";
import ConversionSeoIntro from "@/components/booking/ConversionSeoIntro";
import ConversionTrustPanel from "@/components/booking/ConversionTrustPanel";
import VehicleSummaryCard from "@/components/booking/VehicleSummaryCard";
import { FLEET } from "@/data/fleet";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

interface QuotePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vehicle?: string }>;
}

export async function generateMetadata({ params }: QuotePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as Locale,
    title: "Get an Instant Quote",
    description:
      "Get a fast, no-obligation quote for chauffeur, airport transfer, or VIP transportation services in Dubai. Tell us your trip details and we'll respond shortly.",
    path: "/quote",
  });
}

export default async function QuotePage({ params, searchParams }: QuotePageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { vehicle: vehicleSlug } = await searchParams;
  const vehicle = vehicleSlug ? FLEET.find((v) => v.slug === vehicleSlug) : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Get a Quote", path: "/quote" }], locale as Locale)
          ),
        }}
      />

      <ConversionPageIntro
        heading="Get an Instant Chauffeur Quote"
        description="For airport transfers, business travel, VIP transportation, city rides, and executive chauffeur services across Dubai and the UAE."
      />

      <ConversionSeoIntro>
        Apex Limo &amp; Chauffeur Dubai makes it easy to price a Dubai chauffeur service in
        minutes. Tell us about your airport transfer, business travel, or executive
        transportation needs and we&apos;ll return a fast, no-obligation quote. Our luxury
        vehicles and professional chauffeurs are trusted by executives, tourists, and VIP
        clients across Dubai and the UAE — from a single airport pickup to a full day of VIP
        chauffeur service. Every quote includes the driver, fuel, tolls, and VIP valet parking,
        so the price you see is the price you pay. Share your trip details below and our
        concierge team will respond quickly with accurate, tailored pricing.
      </ConversionSeoIntro>

      <section className="bg-[#0A0A0A] pb-20 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
            <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#111111] p-6 sm:p-8 lg:p-10">
              {vehicle ? <VehicleSummaryCard vehicle={vehicle} /> : null}
              <QuoteForm />
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
