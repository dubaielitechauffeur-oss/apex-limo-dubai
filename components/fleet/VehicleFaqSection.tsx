"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";

interface VehicleFaqSectionProps {
  vehicleName: string;
}

/** Six starter FAQs generated from the vehicle name — chauffeur-hire
 *  focused (this is a chauffeur-driven service, not self-drive rental). */
function buildFaqs(vehicleName: string) {
  return [
    {
      question: `How much does it cost to hire ${vehicleName} with chauffeur in Dubai?`,
      answer: `Chauffeur-driven rates for the ${vehicleName} are shown in the packages above, covering hourly, half-day, full-day and airport-transfer hire. Enquire on WhatsApp or request a quote for an exact price based on your dates and requirements.`,
    },
    {
      question: `Is chauffeur service included with ${vehicleName}?`,
      answer: `Yes — every ${vehicleName} booking includes a professional, uniformed chauffeur. This is a chauffeur-driven service; self-drive is not available.`,
    },
    {
      question: `Can I book ${vehicleName} for airport transfers?`,
      answer: `Yes. The ${vehicleName} is available for DXB and DWC airport transfers with flight tracking and a meet-and-greet as standard, so your chauffeur adjusts pickup time to your actual landing.`,
    },
    {
      question: `Is hourly hire available for ${vehicleName}?`,
      answer: `Yes — the ${vehicleName} can be booked hourly, by the half-day or full-day, in addition to point-to-point transfers. Pricing for each duration is shown in the packages above.`,
    },
    {
      question: `Can I book ${vehicleName} for business meetings?`,
      answer: `Yes. The ${vehicleName} is a popular choice for corporate travel — client pickups, roadshows, and back-to-back meetings — with a chauffeur who can wait on standby between stops.`,
    },
    {
      question: `How far in advance should I book ${vehicleName}?`,
      answer: `Same-day and next-day bookings are often possible, but we recommend booking at least 24–48 hours ahead where you can, and further in advance for weddings, events, or peak dates.`,
    },
  ];
}

/**
 * Dedicated vehicle-page FAQ accordion — light/cream background matching
 * the About section, distinct from the dark ServiceFaqSection/FAQAccordion
 * used elsewhere. Questions are generated from the vehicle name rather
 * than sourced from vehicle.faqs (which continues to back the page's
 * FAQPage JSON-LD, unaffected by this section).
 */
export default function VehicleFaqSection({ vehicleName }: VehicleFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = buildFaqs(vehicleName);

  return (
    <section className="border-t border-gold/10 bg-ivory py-20 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Common Questions"
            title={`${vehicleName} FAQs`}
            subtitle={`Everything you need to know about hiring the ${vehicleName} in Dubai.`}
            align="left"
            tone="light"
          />

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border transition-colors duration-200 ${
                    isOpen ? "border-gold/40 bg-linen/70" : "border-obsidian/10 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base text-obsidian sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gold-deep transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] px-6 pb-5 opacity-100" : "grid-rows-[0fr] px-6 opacity-0"
                    }`}
                  >
                    <p className="overflow-hidden text-sm leading-relaxed text-graphite sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
