"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";

interface VehicleFaqSectionProps {
  vehicleName: string;
}

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

/**
 * Dedicated vehicle-page FAQ accordion — light/cream background matching
 * the About section, distinct from the dark ServiceFaqSection/FAQAccordion
 * used elsewhere. Questions are generated from the vehicle name rather
 * than sourced from vehicle.faqs (which continues to back the page's
 * FAQPage JSON-LD, unaffected by this section).
 */
export default function VehicleFaqSection({ vehicleName }: VehicleFaqSectionProps) {
  const t = useTranslations("fleet.faqSection");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`${key}.question`, { name: vehicleName }),
    answer: t(`${key}.answer`, { name: vehicleName }),
  }));

  return (
    <section className="border-t border-gold/10 bg-ivory py-20 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <Reveal>
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("titleTemplate", { name: vehicleName })}
              subtitle={t("subtitleTemplate", { name: vehicleName })}
              align="left"
              tone="light"
            />
          </Reveal>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <Reveal key={faq.question} delay={Math.min(index * 60, 300)}>
                <div
                  className={`rounded-xl border transition-colors duration-200 ${
                    isOpen ? "border-gold/40 bg-linen/70" : "border-obsidian/10 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start"
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
