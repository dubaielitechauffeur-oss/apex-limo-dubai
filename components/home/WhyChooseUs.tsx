import {
  BadgeCheck,
  Clock,
  Car,
  Wallet,
  Timer,
  Building2,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

const REASONS: Reason[] = [
  {
    icon: BadgeCheck,
    title: "Licensed, Vetted Chauffeurs",
    description:
      "Every driver holds a UAE commercial license, passes a background check, and is trained in professional etiquette.",
  },
  {
    icon: Car,
    title: "Meticulously Maintained Fleet",
    description:
      "Late-model vehicles, detailed and inspected before every booking — no exceptions.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Book a chauffeur any hour, any day. Dubai doesn't stop, and neither do we.",
  },
  {
    icon: Wallet,
    title: "Transparent, Fixed Pricing",
    description:
      "The quote you're given is the price you pay — no surge pricing, no surprise fees.",
  },
  {
    icon: Timer,
    title: "Punctuality Guaranteed",
    description:
      "Flight tracking and route planning mean your chauffeur is always there before you are.",
  },
  {
    icon: Building2,
    title: "Trusted by Corporates & Hotels",
    description:
      "Standing accounts with businesses and hospitality partners across Dubai rely on us daily.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-obsidian py-24">
      <Container>
        <SectionHeading
          eyebrow="Why Apex"
          title="Consistency Is the Luxury"
          subtitle="Anyone can drive a nice car. What clients come back for is knowing exactly what to expect, every single time."
        />

        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex gap-4">
              <reason.icon
                className="mt-1 h-6 w-6 shrink-0 text-gold"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="font-display text-lg text-ivory">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
