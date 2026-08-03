import { useTranslations } from "next-intl";
import { Star, Car, BadgeCheck, Clock, Zap, Quote } from "lucide-react";
import Reveal from "@/components/shared/Reveal";
import Ltr from "@/components/shared/Ltr";
import { RATING, FLEET_SIZE } from "@/lib/constants";
import { TESTIMONIALS } from "@/data/testimonials";

/** One real, published testimonial (see data/testimonials.ts) shown at the
 *  point of conversion — previously this panel had no actual customer
 *  quote, only aggregate numbers, at the exact moment social proof most
 *  reduces booking anxiety. */
const featuredTestimonial = TESTIMONIALS.find((t) => t.featured) ?? TESTIMONIALS[0];

/**
 * Luxury sidebar trust panel shown beside the booking/quote forms — a
 * black-and-gold rating/trust summary plus a "What Happens Next" process,
 * replacing the old phone/WhatsApp quick-contact boxes.
 */
export default function ConversionTrustPanel() {
  const t = useTranslations("forms.conversion");
  const tPanel = useTranslations("forms.conversion.trustPanel");
  const tA11y = useTranslations("common.a11y");

  const trustBullets = [
    { icon: Car, label: t("fleetSizeVehicles", { count: FLEET_SIZE }) },
    { icon: BadgeCheck, label: tPanel("professionalChauffeurs") },
    { icon: Clock, label: tPanel("availability247") },
    { icon: Zap, label: tPanel("fastResponseTimes") },
  ];

  const nextSteps = [
    tPanel("step1"),
    tPanel("step2"),
    tPanel("step3"),
    tPanel("step4"),
  ];

  return (
    <Reveal as="aside" className="rounded-2xl border border-gold/20 bg-ink p-6 sm:p-8">
      {/* Visually the rating/stars below already communicate this section's
          purpose, but screen-reader users navigating by heading (a common
          strategy) would otherwise skip this entire sidebar — nothing in
          it was a real heading before. */}
      <h2 className="sr-only">{tPanel("panelHeading")}</h2>
      <div className="flex gap-0.5" role="img" aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" strokeWidth={1.5} />
        ))}
      </div>
      <p className="mt-2 font-display text-xl text-white"><Ltr>{t("ratingLabel", { rating: RATING })}</Ltr></p>
      <p className="mt-3 text-sm leading-relaxed text-smoke">
        {tPanel("trustedByTemplate")}
      </p>

      <ul className="mt-6 space-y-4 border-t border-gold/15 pt-6">
        {trustBullets.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm text-heading">
            <item.icon className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
            <Ltr>{item.label}</Ltr>
          </li>
        ))}
      </ul>

      {featuredTestimonial ? (
        <div className="mt-6 border-t border-gold/15 pt-6">
          <Quote className="h-5 w-5 text-gold/60" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-2 line-clamp-3 text-sm italic leading-relaxed text-heading">
            {featuredTestimonial.text}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold">
            {featuredTestimonial.name}
            <span className="ms-1 font-normal normal-case text-smoke">
              — {featuredTestimonial.serviceUsed}
            </span>
          </p>
        </div>
      ) : null}

      <div className="mt-8 border-t border-gold/15 pt-6">
        <h3 className="label-eyebrow">{tPanel("whatHappensNext")}</h3>
        <ol className="mt-4 space-y-4">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 text-xs font-semibold text-gold">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm text-smoke">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
