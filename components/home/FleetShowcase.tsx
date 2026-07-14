import Link from "next/link";
import Container from "@/components/shared/Container";
import SectionHeading from "@/components/shared/SectionHeading";
import FleetVehicleCard from "./FleetVehicleCard";
import { FLEET } from "@/data/fleet";

export default function FleetShowcase() {
  return (
    <section className="border-t border-gold/10 bg-linen py-24">
      <Container>
        <SectionHeading
          eyebrow="The Full Fleet"
          title="Fifteen Vehicles. One Uncompromising Standard."
          subtitle="From a discreet daily sedan to the Phantom for an entrance to remember — every vehicle is late-model, detailed before each journey, and matched to your occasion."
          tone="light"
        />

        <div className="mx-auto mt-16 max-w-6xl space-y-8">
          {FLEET.map((vehicle) => (
            <FleetVehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/fleet" className="btn-outline text-obsidian">
            View Full Fleet
          </Link>
        </div>
      </Container>
    </section>
  );
}
