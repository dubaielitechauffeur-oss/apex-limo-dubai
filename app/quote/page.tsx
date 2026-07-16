import type { Metadata } from "next";
import { Phone, MessageCircle, Clock } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Card from "@/components/shared/Card";
import CTAButton from "@/components/shared/CTAButton";
import QuoteForm from "@/components/booking/QuoteForm";
import { buildMetadata } from "@/lib/seo";
import { SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Get an Instant Quote",
  description:
    "Get a fast, no-obligation quote for chauffeur, airport transfer, or VIP transportation services in Dubai. Tell us your trip details and we'll respond shortly.",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <Section tone="ivory" separator={false}>
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="label-eyebrow text-graphite">Fast, No-Obligation</span>
            <h1 className="mt-4 font-display text-3xl text-obsidian sm:text-4xl">
              Get an Instant Quote
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-graphite sm:text-base">
              Share a few trip details and we'll send pricing back quickly —
              no account, no commitment.
            </p>

            <Card tone="dark" className="mt-10 p-6 sm:p-10">
              <QuoteForm />
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:pt-24">
            <div className="sticky top-28 space-y-6">
              <Card tone="dark" className="p-6">
                <h2 className="font-display text-lg text-heading">
                  Need It Faster?
                </h2>
                <ul className="mt-5 space-y-4 text-sm text-smoke">
                  <li>
                    <a
                      href={getPhoneLink()}
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <Phone className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      {SITE.phoneDisplay}
                    </a>
                  </li>
                  <li>
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 transition-colors hover:text-gold"
                    >
                      <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.5} />
                      WhatsApp Us
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    Available 24/7
                  </li>
                </ul>
              </Card>

              <Card tone="dark" className="p-6">
                <h2 className="font-display text-lg text-heading">
                  Ready to Confirm?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-smoke">
                  Already know your details? Skip straight to a full booking
                  instead of a quote.
                </p>
                <CTAButton href="/booking" variant="outline" className="mt-5 w-full">
                  Book Now
                </CTAButton>
              </Card>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
