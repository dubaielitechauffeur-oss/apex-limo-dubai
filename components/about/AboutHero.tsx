import Image from "next/image";
import Container from "@/components/shared/Container";
import { SITE } from "@/lib/constants";

/**
 * About page hero — same dark-overlay treatment and ~45vh height as the
 * Services page hero, with the existing About copy (eyebrow/heading/
 * paragraph) laid over the client's fleet-lineup photo instead of a
 * plain obsidian background.
 */
export default function AboutHero() {
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
        <span className="label-eyebrow">About Apex</span>
        <h1 className="mt-4 font-display text-3xl text-ivory sm:text-5xl">
          Dubai&apos;s Trusted Name in Chauffeur-Driven Luxury
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-smoke sm:text-base">
          {SITE.name} was built on a simple premise: luxury transportation
          should be as dependable as it is comfortable. From a single
          airport transfer to a full wedding convoy, we bring the same
          standard of professionalism to every booking across Dubai and the
          UAE.
        </p>
      </Container>
    </section>
  );
}
