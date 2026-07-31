import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import DirectionalIcon from "@/components/shared/DirectionalIcon";
import Reveal from "@/components/shared/Reveal";
import { getAllLocations, type PlainLocation } from "@/data/locations";
import type { Locale } from "@/i18n/routing";

export interface FeaturedCard {
  location: PlainLocation;
  displayName?: string;
}

/**
 * Curated homepage order + optional display-name override, kept separate
 * from data/locations.ts so the /locations listing page's own order and
 * naming (e.g. "JBR", its real page's own identity) are untouched — this
 * section only picks 6 of the existing locations and how to label them here.
 */
const FEATURED_LOCATIONS: { slug: string; displayName?: string }[] = [
  { slug: "dubai-marina" },
  { slug: "downtown-dubai" },
  { slug: "palm-jumeirah" },
  { slug: "dubai-international-airport-dxb" },
  { slug: "business-bay" },
  { slug: "jbr", displayName: "Jumeirah" },
];

interface LocationsShowcaseProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** "light" (default) — matches the homepage's ivory section. "dark" — for reuse on a black section elsewhere on the site. */
  tone?: "light" | "dark";
  /** Cards to display — defaults to the curated homepage selection.
   *  Pass a custom list (e.g. a location detail page's "other areas")
   *  to reuse this exact card design with a different set of locations. */
  cards?: FeaturedCard[];
}

/**
 * "Where We Operate" — a luxury editorial locations showcase, matching the
 * homepage Services section's card design exactly: large 4:5 portrait
 * photo cards, dark gradient overlay, white typography, and the same
 * scoped gold accent (#C9A14A). Desktop shows 3 per row, tablet 2, and
 * mobile falls back to a native horizontal scroll-snap swipe row.
 */
export default async function LocationsShowcase({
  eyebrow,
  title,
  subtitle,
  tone = "light",
  cards,
}: LocationsShowcaseProps) {
  const locale = await getLocale();
  const t = await getTranslations("locations.showcase");
  const resolvedEyebrow = eyebrow ?? t("eyebrow");
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");

  const resolvedCards =
    cards ??
    (() => {
      const locations = getAllLocations(locale as Locale);
      return FEATURED_LOCATIONS.reduce<FeaturedCard[]>((acc, { slug, displayName }) => {
        const location = locations.find((l) => l.slug === slug);
        if (location) acc.push({ location, displayName });
        return acc;
      }, []);
    })();

  return (
    <section className={`border-t border-gold/10 py-24 ${tone === "dark" ? "bg-obsidian" : "bg-ivory"}`}>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={resolvedEyebrow} title={resolvedTitle} subtitle={resolvedSubtitle} tone={tone} />
        </Reveal>

        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {resolvedCards.map(({ location, displayName }, index) => (
            <Reveal
              key={location.slug}
              delay={Math.min(index * 80, 320)}
              className="w-[82%] shrink-0 snap-center snap-always sm:w-auto sm:shrink"
            >
            <Link
              href={`/locations/${location.slug}`}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.7)]"
            >
              <Image
                src={location.image.src}
                alt={location.image.alt}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />

              {/* Dark gradient overlay for text legibility */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"
              />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-end p-7 sm:p-8">
                <h3 className="font-display text-2xl text-white sm:text-3xl">
                  {displayName ?? location.name}
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {location.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#C9A14A]/50 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wide text-white/90 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#C9A14A] transition-colors duration-200 group-hover:text-[#e0bd6b]">
                  {t("exploreLocation")}
                  <DirectionalIcon
                    icon={ArrowRight}
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
