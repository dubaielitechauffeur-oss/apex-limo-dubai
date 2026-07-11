import { Star, Quote, BadgeCheck } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { TESTIMONIALS } from "@/data/testimonials";
import { SITE } from "@/lib/constants";
import { organizationId } from "@/lib/seo";

/** Renders a row of filled/outline stars for a given rating out of 5. */
function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-gold text-gold" : "fill-transparent text-gold/30"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/** Formats an ISO date as a short relative string, computed server-side — no client JS required. */
function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.round((now - then) / (1000 * 60 * 60 * 24)));

  if (days < 1) return "Today";
  if (days < 30) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  const months = Math.max(1, Math.round(days / 30));
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

/**
 * Review + AggregateRating JSON-LD for the business. Uses the same @id as
 * the root LimousineService entity (see lib/seo.ts) so parsers recognize
 * this as additional data about the one business, not a second entity.
 */
function reviewsJsonLd() {
  const avg =
    TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length;

  return {
    "@context": "https://schema.org",
    "@type": "LimousineService",
    "@id": organizationId(),
    name: SITE.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
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

export default function Testimonials() {
  const avgRating =
    TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.name
  )}`;

  return (
    <section className="bg-charcoal py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd()) }}
      />

      <Container>
        <SectionHeading
          eyebrow="Client Words"
          title="What Riding With Apex Feels Like"
        />

        {/* Aggregate rating summary, styled after a Google Reviews snippet */}
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-2 text-center">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-gold">
              {avgRating.toFixed(1)}
            </span>
            <StarRow rating={Math.round(avgRating)} size="h-5 w-5" />
          </div>
          <p className="text-xs uppercase tracking-wide text-smoke">
            Based on {TESTIMONIALS.length} client reviews
          </p>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
          >
            Find us on Google Maps
          </a>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex flex-col border border-gold/15 bg-obsidian p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-charcoal font-display text-sm text-gold"
                  >
                    {testimonial.avatarInitials}
                  </span>
                  <div>
                    <figcaption className="font-display text-base text-ivory">
                      {testimonial.name}
                    </figcaption>
                    <StarRow rating={testimonial.rating} />
                  </div>
                </div>
                <Quote
                  className="h-5 w-5 shrink-0 text-gold/50"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ivory/90">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-smoke">
                <span>
                  {testimonial.serviceUsed} · {testimonial.location}
                </span>
                <span>{relativeDate(testimonial.date)}</span>
              </div>

              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gold/80">
                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Verified Booking
              </span>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
