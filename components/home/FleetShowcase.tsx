import Link from "next/link";
import { Users, Briefcase, ArrowUpRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import { FLEET } from "@/data/fleet";

export default function FleetShowcase() {
  return (
    <section className="border-t border-gold/10 bg-linen py-24">
      <Container>
        <SectionHeading
          eyebrow="The Fleet"
          title="Six Vehicles. One Standard of Excellence."
          subtitle="Every car is late-model, detailed before each journey, and matched to your occasion — from a discreet sedan to the Phantom for an entrance to remember."
          tone="light"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FLEET.map((vehicle) => (
            <div
              key={vehicle.slug}
              className="group flex flex-col justify-between border border-gold/15 bg-ivory p-7 transition-colors duration-200 hover:border-gold/40"
            >
              <div>
                <span className="label-eyebrow text-[10px] text-graphite">
                  {vehicle.category}
                </span>
                <h3 className="mt-3 font-display text-2xl text-obsidian">
                  {vehicle.name}
                </h3>
                <p className="mt-1 text-sm italic text-graphite">
                  {vehicle.tagline}
                </p>

                <div className="mt-5 flex items-center gap-5 text-xs text-graphite">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                    {vehicle.passengers} passengers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-gold-deep" strokeWidth={1.5} />
                    {vehicle.luggage} bags
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-graphite">
                  Ideal for {vehicle.idealFor.toLowerCase()}.
                </p>
              </div>

              <Link
                href={`/booking?vehicle=${vehicle.slug}`}
                className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-obsidian transition-colors duration-200 group-hover:text-gold-deep"
              >
                Reserve this vehicle
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/fleet"
            className="btn-outline text-obsidian"
          >
            View Full Fleet
          </Link>
        </div>
      </Container>
    </section>
  );
}
