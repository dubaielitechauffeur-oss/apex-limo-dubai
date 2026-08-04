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
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getFaqs } from "@/data/faqs";

interface PageProps {
  params: Promise<{ locale: string }>;
}

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
  return (
    <>
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(getFaqs(locale as Locale))) }}
      />
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
