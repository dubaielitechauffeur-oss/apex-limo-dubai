import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ServicesGrid from "@/components/home/ServicesGrid";
import FleetShowcase from "@/components/home/FleetShowcase";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import BookingCTA from "@/components/home/BookingCTA";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { FAQS } from "@/data/faqs";

export const metadata: Metadata = buildMetadata({
  title: "Premium Chauffeur & Limousine Service in Dubai",
  description:
    "Luxury airport transfers, corporate chauffeur services, VIP transportation and executive travel across Dubai and the UAE. Book a professional chauffeur in minutes.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />
      <Hero />
      <FleetShowcase />
      <ServicesGrid />
      <WhyChooseUs />
      <Testimonials />
      <FAQSection />
      <BookingCTA />
    </>
  );
}
