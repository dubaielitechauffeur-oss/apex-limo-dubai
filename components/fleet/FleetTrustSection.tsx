import { getTranslations } from "next-intl/server";
import { Star, Car, UserCheck, MapPin } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";
import { RATING, FLEET_SIZE } from "@/lib/constants";

/**
 * Fleet page trust band — same visual language and classes as the
 * homepage TrustStats section (icon, big display number, small caption,
 * ivory 4-up grid), with content specific to the Fleet page instead of
 * duplicating/repurposing TrustStats itself.
 */
export default async function FleetTrustSection() {
  const t = await getTranslations("fleet.trust");
  const filledStars = Math.round(parseFloat(RATING));

  const METRICS = [
    { icon: Car, value: `${FLEET_SIZE}`, label: t("luxuryVehicles") },
    { icon: UserCheck, value: "100%", label: t("professionalChauffeurs") },
    { icon: MapPin, value: "24/7", label: t("availableAcross") },
  ];

  return (
    <section className="border-t border-gold/10 bg-ivory py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <Reveal className="flex flex-col items-center gap-2 text-center">
            <div className="flex gap-0.5" role="img" aria-label={`${RATING} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < filledStars ? "fill-gold-deep text-gold-deep" : "fill-transparent text-gold-deep/30"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="font-display text-2xl text-obsidian sm:text-3xl">{RATING}</span>
            <span className="text-xs uppercase tracking-wide text-graphite">{t("rating")}</span>
          </Reveal>

          {METRICS.map((metric, index) => (
            <Reveal key={metric.label} delay={(index + 1) * 80} className="flex flex-col items-center gap-2 text-center">
              <metric.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-display text-2xl text-obsidian sm:text-3xl">{metric.value}</span>
              <span className="text-xs uppercase tracking-wide text-graphite">{metric.label}</span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
