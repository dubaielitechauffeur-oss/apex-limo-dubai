// Homepage hero section
import Link from "next/link";
import { Clock, Car, Languages, Calendar, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import { PRIMARY_CTA, FLEET_SIZE } from "@/lib/constants";

const TRUST_INDICATORS = [
  { icon: Clock, label: "24/7 Concierge" },
  { icon: Car, label: `${FLEET_SIZE} Luxury Vehicles` },
  { icon: Languages, label: "Multilingual Chauffeurs" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-obsidian sm:min-h-[85vh] lg:min-h-[88vh]">
      {/* Full-bleed hero photograph. `<picture>` + `<source media>` swaps the
          file itself (not just the CSS) below 768px, so mobile only ever
          downloads the portrait shot and never the desktop one. */}
      <div className="absolute inset-0">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/home/hero-mobile-burj-khalifa.webp"
          />
          <img
            src="/images/home/hero-chauffeur-door-night.webp"
            alt="Apex Limo chauffeur beside a black Mercedes S-Class in Dubai"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[center_65%] md:object-[70%_center] lg:object-[65%_center]"
          />
        </picture>
      </div>

      {/* Large left-side dark gradient overlay for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"
      />
      {/* Vignette for overall contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/30"
      />

      <Container className="relative z-10 py-24 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold sm:text-sm">
            Dubai&apos;s Premier Chauffeur Service
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-heading sm:text-6xl lg:text-7xl">
            <span className="block">Elevate Every Journey</span>
            <span className="block text-heading">
              with <span className="text-gold">Apex Limo</span>
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-relaxed text-smoke sm:text-lg">
            Experience discreet, professional and luxurious chauffeur-driven
            travel across Dubai and the UAE. Airport transfers, corporate
            travel and private chauffeur services tailored to perfection.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={PRIMARY_CTA.book.href}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
            >
              <Calendar className="h-4 w-4" strokeWidth={2} />
              Book Now
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-ivory/50 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ivory transition-colors duration-200 hover:border-ivory hover:bg-ivory/10"
            >
              Our Services
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-8">
            {TRUST_INDICATORS.map((item, i) => (
              <div key={item.label} className="flex items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className="h-4 w-4 shrink-0 text-gold"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="text-xs uppercase tracking-wide text-ivory/90 sm:text-sm">
                    {item.label}
                  </span>
                </div>
                {i < TRUST_INDICATORS.length - 1 ? (
                  <span
                    className="hidden h-8 w-px bg-gold/25 sm:block"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
