import { Star, Plane, Users, Clock } from "lucide-react";
import Container from "@/components/shared/Container";
import { RATING } from "@/lib/constants";

const TRUST_METRICS = [
  { icon: Star, value: RATING, label: "Rating" },
  { icon: Plane, value: "500+", label: "Airport Transfers" },
  { icon: Users, value: "1000+", label: "Happy Clients" },
  { icon: Clock, value: "24/7", label: "Concierge" },
];

/**
 * Trust metrics band (rating, transfers, clients, concierge) — split out
 * from Testimonials.tsx so it can sit directly below the homepage's Our
 * Brands section instead of at the foot of the testimonials block.
 */
export default function TrustStats() {
  return (
    <section className="border-t border-gold/10 bg-ivory py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {TRUST_METRICS.map((metric) => (
            <div key={metric.label} className="flex flex-col items-center gap-2 text-center">
              <metric.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-display text-2xl text-obsidian sm:text-3xl">{metric.value}</span>
              <span className="text-xs uppercase tracking-wide text-graphite">{metric.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
