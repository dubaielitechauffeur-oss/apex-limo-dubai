import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import BookingCTA from "@/components/home/BookingCTA";
import FaqHubClient from "@/components/faqs/FaqHubClient";
import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { ALL_FAQS } from "@/data/faqHub";

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers about chauffeur services, airport transfers, pricing, bookings, fleet options and luxury transportation across Dubai and the UAE.",
  path: "/faqs",
});

export default function FaqsPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(ALL_FAQS)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "FAQs", path: "/faqs" }])),
        }}
      />

      {/* Hero */}
      <section className="border-b border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
        <Container className="text-center">
          <span className="label-eyebrow">Support Center</span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
            Find answers about chauffeur services, airport transfers, pricing, bookings, fleet
            options and luxury transportation across Dubai and the UAE.
          </p>
        </Container>
      </section>

      {/* Search + category filters + FAQ accordions */}
      <section className="bg-[#161616] py-20 sm:py-24">
        <Container>
          <FaqHubClient />
        </Container>
      </section>

      <BookingCTA
        eyebrow="We're Here to Help"
        heading="Still Need Assistance?"
        subtitle="Our concierge team is on hand 24/7 to help with bookings, quotes, or anything not covered above."
      />
    </div>
  );
}
