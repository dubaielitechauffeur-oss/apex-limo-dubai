import { Star, Car, Headphones } from "lucide-react";
import Container from "@/components/shared/Container";
import { RATING, FLEET_SIZE } from "@/lib/constants";

const OTHER_INDICATORS = [
  { icon: Car, label: `${FLEET_SIZE} Luxury Vehicles` },
  { icon: Headphones, label: "24/7 Concierge Support" },
];

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
  return (
    <section className="border-b border-[rgba(201,161,74,0.15)] bg-[#0A0A0A] pb-10 pt-14 sm:pb-12 sm:pt-20">
      <Container className="text-center">
        <span className="label-eyebrow">Ready When You Are</span>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl text-white sm:text-4xl lg:text-[2.75rem]">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#B8B8B8] sm:text-base">
          {description}
        </p>

        <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#B8B8B8] sm:text-[13px]">
            <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-[#C9A14A] text-[#C9A14A]" strokeWidth={1.5} />
              ))}
            </div>
            {RATING} Rating
          </div>
          {OTHER_INDICATORS.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#B8B8B8] sm:text-[13px]">
              <item.icon className="h-3.5 w-3.5 text-[#C9A14A]" strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
