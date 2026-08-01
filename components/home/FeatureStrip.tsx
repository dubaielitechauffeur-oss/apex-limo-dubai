import { getTranslations } from "next-intl/server";
import { Clock, User, ShieldCheck, Gem, type LucideIcon } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Dark feature band directly below the Hero — four evenly spaced
 * columns (icon, heading, short description), stacking to 2x2 on
 * tablet and a single column on mobile.
 */
export default async function FeatureStrip() {
  const t = await getTranslations("home.featureStrip");

  const FEATURES: Feature[] = [
    { icon: Clock, title: t("punctualTitle"), description: t("punctualDescription") },
    { icon: User, title: t("professionalTitle"), description: t("professionalDescription") },
    { icon: ShieldCheck, title: t("safeTitle"), description: t("safeDescription") },
    { icon: Gem, title: t("luxuryTitle"), description: t("luxuryDescription") },
  ];

  return (
    <section className="border-t border-gold/10 bg-obsidian py-24">
      <Container>
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={index} delay={index * 80} className="flex flex-col items-center text-center">
              <feature.icon className="h-8 w-8 text-gold" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg text-ivory">{feature.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-smoke">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
