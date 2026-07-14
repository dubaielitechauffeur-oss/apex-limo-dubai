import Link from "next/link";
import {
  Plane,
  Briefcase,
  Crown,
  ShieldCheck,
  PartyPopper,
  Heart,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { SERVICES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  "airport-transfers": Plane,
  "corporate-chauffeur": Briefcase,
  "luxury-chauffeur": Crown,
  "vip-transportation": ShieldCheck,
  "event-transportation": PartyPopper,
  "wedding-chauffeur": Heart,
};

export default function ServicesGrid() {
  return (
    <section className="border-t border-gold/10 bg-ivory py-24">
      <Container>
        <SectionHeading
          eyebrow="What We Offer"
          title="Chauffeur Services Built Around You"
          subtitle="From a single airport pickup to a full event fleet, every journey is planned, tracked, and driven to the same standard."
          tone="light"
        />

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.slug] ?? Crown;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex flex-col justify-between bg-ivory p-8 transition-colors duration-200 hover:bg-ivory-off"
              >
                <div>
                  <Icon className="h-7 w-7 text-gold-deep" strokeWidth={1.5} />
                  <h3 className="mt-6 font-display text-xl text-obsidian">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">
                    {service.description}
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors duration-200 group-hover:text-gold-deep">
                  Learn more
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
