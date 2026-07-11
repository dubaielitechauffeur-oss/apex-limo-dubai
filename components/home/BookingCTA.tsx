import { Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import CTAButton from "@/components/shared/CTAButton";
import { PRIMARY_CTA, SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

export default function BookingCTA() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <Container className="relative text-center">
        <span className="label-eyebrow">Ready When You Are</span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl text-ivory sm:text-5xl">
          Reserve Your Chauffeur in Dubai Today
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-smoke sm:text-base">
          Tell us where you're headed and we'll match you with the right
          vehicle and driver — usually confirmed within minutes.
        </p>

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
