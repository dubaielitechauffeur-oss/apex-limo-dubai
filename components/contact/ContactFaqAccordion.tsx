"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ContactFaqAccordionProps {
  faqs: { question: string; answer: string }[];
}

/**
 * Contact page's FAQ accordion, styled to match the FAQ Hub's dark card
 * treatment exactly (collapsed #121212 / expanded #171717, gold chevron,
 * rounded-xl borders) rather than the site's lighter <details> pattern
 * used elsewhere — this page is a fully dark experience end to end.
 */
export default function ContactFaqAccordion({ faqs }: ContactFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className={`rounded-xl border border-[rgba(201,161,74,0.15)] transition-colors duration-300 ${
              isOpen ? "bg-[#171717]" : "bg-[#121212]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
            >
              <span className="font-display text-base text-white sm:text-lg">{faq.question}</span>
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
  );
}
