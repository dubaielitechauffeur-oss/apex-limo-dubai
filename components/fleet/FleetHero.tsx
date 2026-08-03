import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Star, Car, UserCheck, MapPin } from "lucide-react";
import Container from "@/components/shared/Container";
import { RATING, FLEET_SIZE, PRIMARY_CTA } from "@/lib/constants";
import Ltr from "@/components/shared/Ltr";

/**
 * Fleet page hero — a full editorial showroom moment (reusing the same
 * luxury fleet lineup + Burj Khalifa photograph as the homepage CTA, since
 * it's the one asset in the library that actually shows the fleet, not a
 * single car) instead of the previous plain text-only header. "View Fleet"
 * scrolls straight to the listings below rather than navigating away, since
 * they're already on this page.
 */
export default async function FleetHero() {
  const t = await getTranslations("common.cta");
  const tHero = await getTranslations("fleet.hero");
  const tA11y = await getTranslations("common.a11y");
  const filledStars = Math.round(parseFloat(RATING));

  const TRUST_ITEMS = [
    { icon: Car, label: tHero("luxuryVehiclesTemplate", { count: FLEET_SIZE }) },
    { icon: UserCheck, label: tHero("professionalChauffeurs") },
    { icon: MapPin, label: tHero("availableAcross") },
  ];

  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-obsidian py-20 sm:min-h-[80vh] lg:min-h-[85vh]">
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/cta/cta-mobile.webp" />
        <img
          src="/images/cta/cta-desktop.webp"
          alt={tHero("imageAlt")}
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
          <span className="animate-fade-in text-xs font-semibold uppercase tracking-[0.3em] text-gold sm:text-sm">
            {tHero("eyebrow")}
          </span>

          <h1 className="mt-6 animate-slide-in-left font-display text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {tHero("titleTemplate", { count: FLEET_SIZE })}
          </h1>

          <p className="mt-7 max-w-lg animate-fade-in text-base leading-relaxed text-smoke [animation-delay:200ms] sm:text-lg">
            {tHero("subtitle")}
          </p>

          {/* Trust indicators */}
          <div className="mt-9 flex animate-fade-in flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:350ms]">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5" role="img" aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < filledStars ? "fill-gold text-gold" : "fill-transparent text-gold/30"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-white"><Ltr>{tHero("ratingTemplate", { rating: RATING })}</Ltr></span>
            </div>

            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
                <item.icon className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm text-smoke"><Ltr>{item.label}</Ltr></span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex animate-fade-in flex-col gap-4 [animation-delay:500ms] sm:flex-row">
            <a
              href="#fleet-listings"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-colors duration-200 hover:bg-gold-deep"
            >
              {tHero("viewFleet")}
            </a>
            <Link
              href={PRIMARY_CTA.quote.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              {t("getInstantQuote")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
