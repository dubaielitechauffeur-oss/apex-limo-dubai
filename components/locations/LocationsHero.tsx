import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { getPageHero } from "@/lib/public/cms-content";
import type { Locale } from "@/i18n/routing";
import Container from "@/components/shared/Container";

/**
 * Locations page hero — same dark-overlay treatment and ~45vh height as
 * the Services and About page heroes.
 */
export default async function LocationsHero() {
  const t = await getTranslations("locations.hero");
  // Admin → Page Heroes overrides the banner below, per breakpoint. Nothing
  // set (or the database unreachable) keeps the built-in image, so this
  // section always renders.
  const hero = await getPageHero("locations", (await getLocale()) as Locale);
  const fallbackSrc = "/images/locations/locations-hero.webp";
  const alt = hero?.alt ?? t("imageAlt");

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-obsidian py-20 sm:min-h-[45vh]">
      <div className="absolute inset-0">
        {hero?.desktopSrc || hero?.mobileSrc ? (
          <picture>
            <source media="(max-width: 767px)" srcSet={hero.mobileSrc ?? hero.desktopSrc ?? fallbackSrc} />
            <img
              src={hero.desktopSrc ?? fallbackSrc}
              alt={alt}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>
        ) : (
          <Image
            src={fallbackSrc}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
      </div>

      {/* Dark overlay for text legibility, matching the Services/About heroes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30"
      />

      <Container className="relative z-10 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="animate-fade-in text-xs font-semibold uppercase tracking-[0.3em] text-gold sm:text-sm">
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 animate-slide-in-left font-display text-4xl leading-[1.1] text-heading sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-in text-base leading-relaxed text-smoke [animation-delay:200ms] sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </Container>
    </section>
  );
}
