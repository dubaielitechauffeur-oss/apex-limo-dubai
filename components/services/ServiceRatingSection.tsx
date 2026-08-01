import { getTranslations } from "next-intl/server";
import { Star, type LucideIcon } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import Reveal from "@/components/shared/Reveal";
import { RATING } from "@/lib/constants";

/** Renders a row of filled/outline stars for the site rating (out of 5). */
function StarRow({ ariaLabel }: { ariaLabel: string }) {
  const filled = Math.round(parseFloat(RATING));
  return (
    <div className="flex gap-0.5" role="img" aria-label={ariaLabel}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-6 w-6 ${i < filled ? "fill-gold-deep text-gold-deep" : "fill-transparent text-gold-deep/30"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

interface ServiceRatingSectionProps {
  eyebrow: string;
  title: string;
  metricIcon: LucideIcon;
  metricValue: string;
  metricLabel: string;
  reviewsCaption: string;
  outOf5Label: string;
}

/**
 * "Happy Clients / Rating" band for service pages — same visual language as
 * the homepage Testimonials rating row (stars, RATING constant, ivory
 * section), paired with one metric that varies by service context.
 */
export default async function ServiceRatingSection({
  eyebrow,
  title,
  metricIcon: MetricIcon,
  metricValue,
  metricLabel,
  reviewsCaption,
  outOf5Label,
}: ServiceRatingSectionProps) {
  const tA11y = await getTranslations("common.a11y");
  return (
    <section className="border-t border-gold/10 bg-pearl py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} tone="light" />
        </Reveal>

        <div className="mx-auto mt-12 flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16">
          <Reveal className="flex flex-col items-center gap-3 text-center">
            <StarRow ariaLabel={tA11y("ratingOutOf5Template", { rating: RATING })} />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-obsidian">{RATING}</span>
              <span className="text-xs uppercase tracking-wide text-graphite">{outOf5Label}</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite">
              {reviewsCaption}
            </p>
          </Reveal>

          <span className="hidden h-20 w-px bg-gold/20 sm:block" aria-hidden="true" />

          <Reveal delay={100} className="flex flex-col items-center gap-3 text-center">
            <MetricIcon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-display text-4xl text-obsidian">{metricValue}</span>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite">{metricLabel}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
