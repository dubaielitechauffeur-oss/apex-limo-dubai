import Link from "next/link";
import { Phone } from "lucide-react";
import Container from "@/components/shared/Container";
import { SITE, getPhoneLink, getWhatsAppLink } from "@/lib/constants";

const RECOMMENDATIONS = [
  {
    name: "Mercedes S-Class",
    blurb: "Ideal for executives and business travel.",
    slug: "mercedes-s-class",
  },
  {
    name: "Mercedes V-Class",
    blurb: "Perfect for families and small groups.",
    slug: "mercedes-v-class",
  },
  {
    name: "Rolls-Royce",
    blurb: "For VIP occasions and premium experiences.",
    slug: "rolls-royce-phantom",
  },
  {
    name: "Range Rover",
    blurb: "Luxury city travel and events.",
    slug: "range-rover-autobiography",
  },
];

/**
 * "Fleet Concierge" — a black/gold recommendation panel that helps
 * undecided visitors pick a vehicle type, styled to match the FAQ Hub's
 * premium dark presentation. Sits just before the closing Booking CTA.
 */
export default function FleetConciergeSection() {
  return (
    <section className="border-t border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] py-20 sm:py-24">
      <Container className="max-w-5xl text-center">
        <span className="label-eyebrow">Personal Concierge</span>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl text-white sm:text-4xl">
          Need Help Choosing the Right Vehicle?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
          A quick guide to get you started — or speak to our concierge team for a
          personal recommendation.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {RECOMMENDATIONS.map((item) => (
            <Link
              key={item.name}
              href={`/fleet/${item.slug}`}
              className="group rounded-xl border border-[rgba(201,161,74,0.15)] bg-[#121212] p-6 transition-colors duration-200 hover:border-[#C9A14A]/50 hover:bg-[#171717]"
            >
              <h3 className="font-display text-lg text-white transition-colors duration-200 group-hover:text-[#C9A14A]">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">{item.blurb}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={getPhoneLink()}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#C9A14A] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors duration-200 hover:bg-[#b8903f]"
          >
            <Phone className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Call {SITE.phoneDisplay}
          </a>
          <a
            href={getWhatsAppLink("Hi, I'd like help choosing the right vehicle.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-[rgba(201,161,74,0.4)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-[#C9A14A] hover:text-[#C9A14A]"
          >
            WhatsApp Us
          </a>
        </div>
      </Container>
    </section>
  );
}
