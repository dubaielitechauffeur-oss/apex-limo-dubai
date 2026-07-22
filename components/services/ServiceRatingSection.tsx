import { Star, type LucideIcon } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { RATING } from "@/lib/constants";

/** Renders a row of filled/outline stars for the site rating (out of 5). */
function StarRow() {
  const filled = Math.round(parseFloat(RATING));
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
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
  eyebrow?: string;
  title?: string;
  metricIcon: LucideIcon;
  metricValue: string;
  metricLabel: string;
}

/**
 * "Happy Clients / Rating" band for service pages — same visual language as
 * the homepage Testimonials rating row (stars, RATING constant, ivory
 * section), paired with one metric that varies by service context.
 */
export default function ServiceRatingSection({
  eyebrow = "Trusted in Dubai",
  title = "Rated by Our Clients",
  metricIcon: MetricIcon,
  metricValue,
  metricLabel,
}: ServiceRatingSectionProps) {
  return (
    <section className="border-t border-gold/10 bg-pearl py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} tone="light" />

        <div className="mx-auto mt-12 flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <StarRow />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-obsidian">{RATING}</span>
              <span className="text-xs uppercase tracking-wide text-graphite">/ 5 Rating</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite">
              Based on verified client reviews
            </p>
          </div>

          <span className="hidden h-20 w-px bg-gold/20 sm:block" aria-hidden="true" />

          <div className="flex flex-col items-center gap-3 text-center">
            <MetricIcon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-display text-4xl text-obsidian">{metricValue}</span>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite">{metricLabel}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
