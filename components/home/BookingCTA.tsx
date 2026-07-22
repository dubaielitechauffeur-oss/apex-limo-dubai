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
    <section className="relative overflow-hidden border-t border-gold/10 bg-ink py-24 xl:min-h-[560px] 2xl:min-h-[680px]">
      {/* Luxury background photograph. Mobile/tablet keep the original
          <picture> + <source media> crop swap, untouched. Desktop (xl+)
          swaps to a fixed-attachment CSS background instead: the image
          stays pinned to the viewport while the section content scrolls
          over it, and is repositioned lower so the vehicle lineup and Burj
          Khalifa carry the frame instead of empty sky. */}
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
          className="absolute inset-0 h-full w-full object-cover xl:hidden"
        />
      </picture>
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-fixed xl:block"
        style={{
          backgroundImage: "url('/images/cta/cta-desktop.webp')",
          backgroundPosition: "center 65%",
        }}
      />

      {/* Dark overlay for text contrast. Mobile/tablet keep the original
          vignette (soft top/bottom, darkest through the middle). Desktop
          (xl+) uses one flat, uniform tone across the whole image instead
          of a vignette, matching the reference brand's presentation. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/35 xl:hidden" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/50 to-black/25 xl:hidden"
      />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-black/45 xl:block" />

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
