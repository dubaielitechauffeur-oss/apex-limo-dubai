import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Hero from "@/components/home/Hero";
import FeatureStrip from "@/components/home/FeatureStrip";
import ServicesGrid from "@/components/home/ServicesGrid";
import LocationsShowcase from "@/components/home/LocationsShowcase";
import FleetCarousel from "@/components/home/FleetCarousel";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import TrustStats from "@/components/home/TrustStats";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd, organizationReviewsJsonLd } from "@/lib/seo";
import { getHomepageFaqs } from "@/lib/public/cms-content";
import JsonLd from "@/components/shared/JsonLd";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Time-based ISR fallback, matching every other CMS-backed public page
// (see app/[locale]/fleet/page.tsx and friends) — the homepage reads
// admin-managed vehicle rates via the Fleet carousel, so it needs the
// same freshness guarantee. Admin actions that touch vehicle data also
// call revalidatePublicFleet(), which revalidates "/" immediately; this
// export is the safety net for the rare case that revalidation is missed.
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("description"),
    path: "/",
  });
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  // Same rows the rendered FAQSection below uses, so the structured data can
  // never describe questions the page does not actually show.
  const homepageFaqs = await getHomepageFaqs(locale as Locale);
  const reviewsJsonLd = organizationReviewsJsonLd(locale as Locale);
  return (
    <>
      <JsonLd data={faqJsonLd(homepageFaqs, locale as Locale)} />
      {/* `JsonLd` renders nothing for a null node, so no guard is needed here. */}
      <JsonLd data={reviewsJsonLd} />
      <Hero />
      <FeatureStrip />
      <FleetCarousel />
      <BrandsShowcase />
      <TrustStats />
      <ServicesGrid />
      <LocationsShowcase />
      <WhyChooseUs />
      <Testimonials />
      <FAQSection />
      <BookingCTA backgroundImage={false} />
    </>
  );
}
