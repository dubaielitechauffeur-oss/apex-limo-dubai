import Link from "next/link";
import { Star, Car, UserCheck, MapPin } from "lucide-react";
import Container from "@/components/shared/Container";
import { RATING, FLEET_SIZE, PRIMARY_CTA } from "@/lib/constants";

const TRUST_ITEMS = [
  { icon: Car, label: `${FLEET_SIZE} Luxury Vehicles` },
  { icon: UserCheck, label: "Professional Chauffeurs" },
  { icon: MapPin, label: "Available Across Dubai & UAE" },
];

/**
 * Fleet page hero — a full editorial showroom moment (reusing the same
 * luxury fleet lineup + Burj Khalifa photograph as the homepage CTA, since
 * it's the one asset in the library that actually shows the fleet, not a
 * single car) instead of the previous plain text-only header. "View Fleet"
 * scrolls straight to the listings below rather than navigating away, since
 * they're already on this page.
 */
export default function FleetHero() {
  const filledStars = Math.round(parseFloat(RATING));

  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-[#0A0A0A] py-20 sm:min-h-[80vh] lg:min-h-[85vh]">
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/cta/cta-mobile.webp" />
        <img
          src="/images/cta/cta-desktop.webp"
          alt="The Apex Limo luxury fleet lineup with the Burj Khalifa skyline in Dubai"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
        />
      </picture>

      {/* Left-side dark gradient for text legibility — extra stops keep the
          text column (which runs to ~60% width) fully covered instead of
          fading out under it against the bright sky/glass towers. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.62) 62%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40"
      />

      <Container className="relative z-10">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A14A] sm:text-sm">
            Luxury Chauffeur Fleet
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {FLEET_SIZE} Luxury Vehicles for Every Occasion
          </h1>

          <p className="mt-7 max-w-lg text-base leading-relaxed text-[#B8B8B8] sm:text-lg">
            Choose from executive sedans, VIP SUVs, luxury vans, and
            chauffeur-driven vehicles available across Dubai and the UAE.
          </p>

          {/* Trust indicators */}
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < filledStars ? "fill-[#C9A14A] text-[#C9A14A]" : "fill-transparent text-[#C9A14A]/30"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">{RATING} Rating</span>
            </div>

            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
                <item.icon className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm text-[#B8B8B8]">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#fleet-listings"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#C9A14A] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors duration-200 hover:bg-[#b8903f]"
            >
              View Fleet
            </a>
            <Link
              href={PRIMARY_CTA.quote.href}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-[#C9A14A] hover:text-[#C9A14A]"
            >
              {PRIMARY_CTA.quote.label}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
