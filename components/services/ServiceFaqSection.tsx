"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

interface ServiceFaqSectionProps {
  faqs: ServiceFaqItem[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
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
  eyebrow = "Common Questions",
  title = "Frequently Asked Questions",
  subtitle,
}: ServiceFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
      <Container className="max-w-4xl text-center">
        <span className="label-eyebrow">{eyebrow}</span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl text-white sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-14 space-y-3 text-left">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-xl border border-[rgba(201,161,74,0.15)] transition-all duration-300 ${
                  isOpen ? "bg-[#171717]" : "bg-[#121212]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
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
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#C9A14A] transition-colors duration-200 hover:text-[#e0bd6b]"
          >
            View All FAQs
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
