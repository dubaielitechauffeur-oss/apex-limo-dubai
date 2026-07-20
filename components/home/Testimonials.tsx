import { Star, BadgeCheck } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE, RATING } from "@/lib/constants";
import { organizationId } from "@/lib/seo";

/** Renders a row of filled/outline stars for a given rating out of 5. */
function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-gold-deep text-gold-deep" : "fill-transparent text-gold-deep/30"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/**
 * Review + AggregateRating JSON-LD for the business. Uses the same @id as
 * the root LimousineService entity (see lib/seo.ts) so parsers recognize
 * this as additional data about the one business, not a second entity.
 * Built from every testimonial, not just the 3 featured on-page, so the
 * aggregate rating reflects the full review count.
 */
function reviewsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LimousineService",
    "@id": organizationId(),
    name: SITE.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: RATING,
      reviewCount: TESTIMONIALS.length,
      bestRating: 5,
    },
    review: TESTIMONIALS.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: 5,
      },
      reviewBody: t.text,
      datePublished: t.date,
    })),
  };
}

/**
 * "Client Words" — a curated 3-card spotlight (not a full review grid), styled
 * as a premium editorial pull-quote: white cards, black typography, gold
 * accents, and an oversized decorative quotation mark per card. The
 * aggregate rating/JSON-LD above and below the cards still reflects every
 * review in data/testimonials.ts, not just the 3 marked `featured`.
 */
export default function Testimonials() {
  const featured = TESTIMONIALS.filter((t) => t.featured);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.name
  )}`;

  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd()) }}
      />

      <Container>
        <SectionHeading
          eyebrow="Client Words"
          title="What Riding With Apex Feels Like"
          tone="light"
        />

        {/* Google-style aggregate rating */}
        <div className="mx-auto mt-10 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <StarRow rating={Math.round(parseFloat(RATING))} size="h-6 w-6" />
            <span className="font-display text-3xl text-obsidian">{RATING}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-graphite">
            Based on verified client reviews
          </p>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-obsidian underline underline-offset-4 transition-colors hover:text-gold-deep"
          >
            Find us on Google Maps
          </a>
        </div>

        {/* Featured testimonials */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-ivory p-10 shadow-[0_16px_35px_-22px_rgba(10,10,10,0.35)] sm:p-12"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 left-8 select-none font-display text-[110px] leading-none text-gold/15"
              >
                &ldquo;
              </span>

              <div className="relative flex h-full flex-col">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-deep">
                  {testimonial.serviceUsed}
                </p>

                <blockquote className="mt-5 font-display text-xl italic leading-relaxed text-obsidian">
                  {testimonial.text}
                </blockquote>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 pt-8">
                  <figcaption className="text-base font-semibold text-obsidian">
                    {testimonial.name}
                  </figcaption>
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-graphite">
                    <BadgeCheck className="h-3.5 w-3.5 text-gold-deep" strokeWidth={1.5} />
                    Verified Client
                  </span>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
