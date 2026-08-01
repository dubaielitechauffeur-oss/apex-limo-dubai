"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";
import DirectionalIcon from "@/components/shared/DirectionalIcon";

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

interface ServiceFaqSectionProps {
  faqs: ServiceFaqItem[];
  eyebrow: string;
  title: string;
  subtitle?: string;
  viewAllLabel: string;
}

/**
 * Service-page FAQ block redesigned to match the FAQ Hub's premium dark
 * presentation (`/faqs`) instead of the photo-backed homepage FAQAccordion:
 * pure black section, centered heading, and the same card/accordion
 * treatment as FaqHubClient — just without the search/category chrome,
 * since a service page only ever shows that service's own FAQs.
 */
export default function ServiceFaqSection({
  faqs,
  eyebrow,
  title,
  subtitle,
  viewAllLabel,
}: ServiceFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
      <Container className="max-w-4xl text-center">
        <Reveal>
          <span className="label-eyebrow">{eyebrow}</span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl text-white sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </Reveal>

        <div className="mt-14 space-y-3 text-start">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={Math.min(index * 60, 300)}>
              <div
                className={`rounded-xl border border-[rgba(201,161,74,0.15)] transition-all duration-300 ${
                  isOpen ? "bg-[#171717]" : "bg-[#121212]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start"
                >
                  <span className="font-display text-base text-white sm:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#C9A14A] transition-transform duration-200 ${
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
                  <p className="overflow-hidden text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#C9A14A] transition-colors duration-200 hover:text-[#e0bd6b]"
          >
            {viewAllLabel}
            <DirectionalIcon icon={ArrowRight} className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
