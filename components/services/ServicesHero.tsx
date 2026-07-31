import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Container from "@/components/shared/Container";
import { PRIMARY_CTA } from "@/lib/constants";

/**
 * Shorter interior-page hero for /services — same dark-overlay treatment
 * as the homepage Hero, but ~45vh instead of near-full-viewport since
 * this is a secondary page, not the main landing hero.
 */
export default async function ServicesHero() {
  const t = await getTranslations("services.hero");

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-obsidian py-20 sm:min-h-[45vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/services/services-hero-chauffeur-door.webp"
          alt={t("imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center]"
        />
      </div>

      {/* Dark overlay for text legibility, matching the homepage hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30"
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
          <div className="mt-8 flex animate-fade-in justify-center [animation-delay:350ms]">
            <Link
              href={PRIMARY_CTA.book.href}
              className="inline-flex items-center justify-center rounded-lg bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition-colors duration-200 hover:bg-gold-deep"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
