import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";
import BookingForm from "@/components/booking/BookingForm";
import ConversionPageIntro from "@/components/booking/ConversionPageIntro";
import ConversionSeoIntro from "@/components/booking/ConversionSeoIntro";
import ConversionTrustPanel from "@/components/booking/ConversionTrustPanel";
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
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Booking", path: "/booking" }], locale as Locale)
          ),
        }}
      />

      <ConversionPageIntro
        heading="Book Your Dubai Chauffeur"
        description="For airport transfers, business travel, VIP transportation, city rides, and executive chauffeur services across Dubai and the UAE."
      />

      <ConversionSeoIntro>
        Apex Limo &amp; Chauffeur Dubai offers a premium Dubai chauffeur service built around
        reliability and discretion. Whether you need airport transfers to DXB or DWC, business
        travel between meetings, or executive transportation for a full day, our professional
        chauffeurs deliver a polished, on-time experience every time. Reserve one of our luxury
        vehicles — from executive sedans to the Rolls-Royce Phantom — for VIP chauffeur service
        across Dubai and the wider UAE. Every booking includes a licensed, background-checked
        driver, fuel, tolls, and VIP valet parking, so you can focus on your journey instead of
        the details. Complete the form below and our concierge team will confirm your
        reservation shortly.
      </ConversionSeoIntro>

      <section className="bg-[#0A0A0A] pb-20 sm:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-10">
            <div className="rounded-2xl border border-[rgba(201,161,74,0.15)] bg-[#111111] p-6 sm:p-8 lg:p-10">
              <BookingForm />
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
