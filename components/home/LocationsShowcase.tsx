import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { LOCATIONS, type Location } from "@/data/locations";

interface FeaturedCard {
  location: Location;
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

/**
 * "Where We Operate" — a luxury editorial locations showcase, matching the
 * homepage Services section's card design exactly: large 4:5 portrait
 * photo cards, dark gradient overlay, white typography, and the same
 * scoped gold accent (#C9A14A). Desktop shows 3 per row, tablet 2, and
 * mobile falls back to a native horizontal scroll-snap swipe row.
 */
export default function LocationsShowcase() {
  const cards = FEATURED_LOCATIONS.reduce<FeaturedCard[]>((acc, { slug, displayName }) => {
    const location = LOCATIONS.find((l) => l.slug === slug);
    if (location) acc.push({ location, displayName });
    return acc;
  }, []);

  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <SectionHeading
          eyebrow="Where We Operate"
          title="Premium Chauffeur Service Across Dubai & UAE"
          subtitle="Luxury chauffeur services available across Dubai's most important business, leisure and residential destinations."
          tone="light"
        />

        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {cards.map(({ location, displayName }) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className="group relative aspect-[4/5] w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.7)] sm:w-auto sm:shrink"
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
                  Explore Location
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
