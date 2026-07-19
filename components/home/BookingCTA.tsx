import { Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import CTAButton from "@/components/shared/CTAButton";
import SectionHeading from "@/components/shared/SectionHeading";
import { PRIMARY_CTA, SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

export default function BookingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-gold/10 bg-ink py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <Container className="relative text-center">
        <SectionHeading
          eyebrow="Ready When You Are"
          title="Reserve Your Chauffeur in Dubai Today"
          subtitle="Tell us where you're headed and we'll match you with the right vehicle and driver — usually confirmed within minutes."
          tone="dark"
        />

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
