import { Clock, User, ShieldCheck, Gem, type LucideIcon } from "lucide-react";
import Container from "@/components/shared/Container";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Clock,
    title: "Punctual",
    description: "We value your time and ensure on-time service, every time.",
  },
  {
    icon: User,
    title: "Professional Chauffeurs",
    description: "Licensed, background-checked drivers trained in etiquette and discretion.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Reliable",
    description: "Insured vehicles and consistent safety standards on every single trip.",
  },
  {
    icon: Gem,
    title: "Luxury Experience",
    description: "A premium fleet and attentive service, matched to every occasion.",
  },
];

/**
 * Dark feature band directly below the Hero — four evenly spaced
 * columns (icon, heading, short description), stacking to 2x2 on
 * tablet and a single column on mobile.
 */
export default function FeatureStrip() {
  return (
    <section className="border-t border-gold/10 bg-obsidian py-24">
      <Container>
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <feature.icon className="h-8 w-8 text-gold" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg text-ivory">{feature.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-smoke">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
