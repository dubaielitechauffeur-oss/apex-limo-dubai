import { useTranslations } from "next-intl";
import { Star, Car, Headphones } from "lucide-react";
import Container from "@/components/shared/Container";
import Ltr from "@/components/shared/Ltr";
import { RATING, FLEET_SIZE } from "@/lib/constants";

interface ConversionPageIntroProps {
  heading: string;
  description: string;
}

/**
 * Compact conversion-page intro — label, heading, short description, and
 * inline trust indicators. Deliberately not a homepage-style hero: no
 * background image, no large vertical padding, no secondary CTAs.
 */
export default function ConversionPageIntro({ heading, description }: ConversionPageIntroProps) {
  const t = useTranslations("forms.conversion");
  const tA11y = useTranslations("common.a11y");
  const otherIndicators = [
    { icon: Car, label: t("fleetSizeVehicles", { count: FLEET_SIZE }) },
    { icon: Headphones, label: t("concierge247") },
  ];

  return (
    <section className="border-b border-gold/15 bg-obsidian pb-10 pt-14 sm:pb-12 sm:pt-20">
      <Container className="text-center">
        <span className="animate-fade-in label-eyebrow">{t("readyWhenYouAre")}</span>
        <h1 className="mx-auto mt-4 max-w-2xl animate-slide-in-left font-display text-3xl text-white [animation-delay:100ms] sm:text-4xl lg:text-[2.75rem]">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-in text-sm leading-relaxed text-smoke [animation-delay:250ms] sm:text-base">
          {description}
        </p>

        <div className="mx-auto mt-7 flex max-w-2xl animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-3 [animation-delay:400ms]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-smoke sm:text-[13px]">
            <div className="flex gap-0.5" role="img" aria-label={tA11y("ratingOutOf5Template", { rating: RATING })}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" strokeWidth={1.5} />
              ))}
            </div>
            <Ltr>{t("ratingLabel", { rating: RATING })}</Ltr>
          </div>
          {otherIndicators.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-smoke sm:text-[13px]">
              <item.icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} aria-hidden="true" />
              <Ltr>{item.label}</Ltr>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
