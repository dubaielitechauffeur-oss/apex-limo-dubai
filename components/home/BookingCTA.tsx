import { Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import CTAButton from "@/components/shared/CTAButton";
import SectionHeading from "@/components/shared/SectionHeading";
import { PRIMARY_CTA, SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

interface BookingCTAProps {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
}

export default function BookingCTA({
  eyebrow = "Ready When You Are",
  heading = "Reserve Your Chauffeur in Dubai Today",
  subtitle = "Tell us where you're headed and we'll match you with the right vehicle and driver — usually confirmed within minutes.",
}: BookingCTAProps) {
  return (
    <section className="relative overflow-hidden border-t border-gold/10 bg-ink py-24">
      {/* Luxury background photograph — separate mobile/desktop crops, same
          <picture> + <source media> swap pattern as the homepage Hero. */}
      <div className="absolute inset-0">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/cta/cta-mobile.webp"
          />
          <img
            src="/images/cta/cta-desktop.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
      </div>

      {/* Medium-dark overlay — keeps the vehicle/chauffeur/skyline visible
          while holding text contrast. A flat scrim plus a soft vertical
          vignette (darkest where the heading/buttons sit) instead of one
          uniform near-opaque layer. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/50 to-black/25"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <Container className="relative text-center">
        <SectionHeading eyebrow={eyebrow} title={heading} subtitle={subtitle} tone="dark" />

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CTAButton href={PRIMARY_CTA.book.href}>
            {PRIMARY_CTA.book.label}
          </CTAButton>
          <CTAButton href={PRIMARY_CTA.quote.href} variant="outline">
            {PRIMARY_CTA.quote.label}
          </CTAButton>
          <CTAButton href={getWhatsAppLink()} variant="outline" external>
            {PRIMARY_CTA.whatsapp.label}
          </CTAButton>
        </div>

        <a
          href={getPhoneLink()}
          className="mt-8 inline-flex items-center gap-2 text-sm text-smoke transition-colors hover:text-gold"
        >
          <Phone className="h-4 w-4" strokeWidth={1.5} />
          {SITE.phoneDisplay}
        </a>
      </Container>
    </section>
  );
}
