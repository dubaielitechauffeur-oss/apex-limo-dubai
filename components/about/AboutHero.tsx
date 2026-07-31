import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/shared/Container";
import { SITE } from "@/lib/constants";

/**
 * About page hero — same dark-overlay treatment and ~45vh height as the
 * Services page hero, with the existing About copy (eyebrow/heading/
 * paragraph) laid over the client's fleet-lineup photo instead of a
 * plain obsidian background.
 */
export default async function AboutHero() {
  const t = await getTranslations("about.hero");

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-obsidian py-20 sm:min-h-[45vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/about/about-hero-fleet-lineup.webp"
          alt="A lineup of black Mercedes chauffeur sedans and vans parked side by side"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Dark overlay for text legibility, matching the Services hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30"
      />

      <Container className="relative z-10 max-w-3xl">
        <span className="animate-fade-in label-eyebrow">{t("eyebrow")}</span>
        <h1 className="mt-4 animate-slide-in-left font-display text-3xl text-heading [animation-delay:100ms] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 animate-fade-in text-sm leading-relaxed text-smoke [animation-delay:250ms] sm:text-base">
          {t("paragraph", { siteName: SITE.name })}
        </p>
      </Container>
    </section>
  );
}
