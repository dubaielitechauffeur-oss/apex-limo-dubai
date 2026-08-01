import { getTranslations } from "next-intl/server";
import { Star, Plane, Users, Clock } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";
import { RATING } from "@/lib/constants";

/**
 * Trust metrics band (rating, transfers, clients, concierge) — split out
 * from Testimonials.tsx so it can sit directly below the homepage's Our
 * Brands section instead of at the foot of the testimonials block.
 */
export default async function TrustStats() {
  const t = await getTranslations("home.trustStats");

  const TRUST_METRICS = [
    { icon: Star, value: RATING, label: t("rating") },
    { icon: Plane, value: "500+", label: t("airportTransfers") },
    { icon: Users, value: "1000+", label: t("happyClients") },
    { icon: Clock, value: "24/7", label: t("concierge") },
  ];

  return (
    <section className="border-t border-gold/10 bg-ivory py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {TRUST_METRICS.map((metric, index) => (
            <Reveal key={index} delay={index * 80} className="flex flex-col items-center gap-2 text-center">
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
