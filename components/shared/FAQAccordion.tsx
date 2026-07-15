"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Dark, fixed-background FAQ accordion — shared between the homepage
 * and interior pages so every FAQ section on the site uses the exact
 * same background photo, overlay, and accordion styling. Only one
 * question stays open at a time; the open item gets a gold left
 * border, gold text, and an up-chevron, closed items a muted
 * down-chevron.
 */
export default function FAQAccordion({
  faqs,
  eyebrow = "Good to Know",
  title = "Frequently Asked Questions",
  subtitle,
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative isolate overflow-hidden border-t border-gold/10 bg-obsidian py-24">
      {/* Fixed background photograph — bg-fixed only above the mobile
          breakpoint, since background-attachment: fixed is unreliable on
          iOS Safari; below md it falls back to the normal scrolling
          background (still bg-cover, just moves with the page). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-scroll bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: "url(/images/home/faq-mercedes-dubai-skyline.webp)" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-obsidian/80" />

      <Container className="relative z-10 max-w-4xl">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} tone="dark" />

        <div className="mt-14 divide-y divide-white/10 border-y border-white/10 bg-charcoal/40 backdrop-blur-sm">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`border-l-2 transition-colors duration-200 ${
                  isOpen ? "border-gold" : "border-transparent"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left"
                >
                  <span
                    className={`font-display text-lg transition-colors duration-200 sm:text-xl ${
                      isOpen ? "text-gold" : "text-ivory"
                    }`}
                  >
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-smoke" strokeWidth={1.5} />
                  )}
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] px-6 pb-6 opacity-100" : "grid-rows-[0fr] px-6 opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-smoke sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
