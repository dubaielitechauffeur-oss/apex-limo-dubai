import Image from "next/image";
import Link from "next/link";
import { Clock, Car, Languages } from "lucide-react";
import Container from "@/components/shared/Container";
import { PRIMARY_CTA, getPhoneLink } from "@/lib/constants";

const TRUST_INDICATORS = [
  { icon: Clock, label: "24/7 Concierge" },
  { icon: Car, label: "50+ Luxury Vehicles" },
  { icon: Languages, label: "Multilingual Chauffeurs" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-obsidian lg:min-h-[calc(100vh-117px)]">
      {/* Full-bleed hero photograph — chauffeur and Mercedes framed on the right */}
      <div className="absolute inset-0">
        <Image
          src="/images/home/hero-luxury-dubai.webp"
          alt="Apex Limo chauffeur standing beside a Mercedes S-Class with the Dubai skyline and Burj Khalifa at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[80%_center] md:object-[70%_center] lg:object-[75%_center]"
        />
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

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
            <span className="block">Elevate Every Journey</span>
            <span className="block text-ivory">
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
              className="inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
            >
              Book Chauffeur
            </Link>
            <a
              href={getPhoneLink()}
              className="inline-flex items-center justify-center rounded-sm border border-gold/60 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-ivory transition-colors duration-200 hover:border-gold hover:bg-gold/10"
            >
              Call Now
            </a>
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
