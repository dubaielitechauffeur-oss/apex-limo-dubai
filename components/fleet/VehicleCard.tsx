import Link from "next/link";
import { Users, Briefcase, Check } from "lucide-react";
import CTAButton from "@/components/shared/CTAButton";
import VehicleGallery from "./VehicleGallery";
import type { FleetVehicle } from "@/data/fleet";

interface VehicleCardProps {
  vehicle: FleetVehicle;
}

/** Full specification card for a single fleet vehicle, used on the fleet listing page. */
export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="flex flex-col border border-gold/15 bg-charcoal p-6 transition-colors duration-200 hover:border-gold/35">
      <VehicleGallery vehicle={vehicle} />

      <div className="mt-6 flex-1">
        <p className="text-xs italic text-gold/90">{vehicle.tagline}</p>
        <h2 className="mt-1 font-display text-2xl text-ivory">{vehicle.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-smoke">
          {vehicle.description}
        </p>

        {/* Specs */}
        <div className="mt-5 flex items-center gap-5 border-y border-white/10 py-4 text-xs text-smoke">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {vehicle.passengers} passengers
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {vehicle.luggage} bags
          </span>
        </div>

        <p className="mt-4 text-xs uppercase tracking-wide text-smoke">
          Ideal for <span className="text-gold">{vehicle.idealFor.toLowerCase()}</span>
        </p>

        {/* Features */}
        <ul className="mt-5 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {vehicle.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-smoke">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2} />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <CTAButton href={`/booking?vehicle=${vehicle.slug}`} className="flex-1">
          Book Now
        </CTAButton>
        <Link
          href={`/quote?vehicle=${vehicle.slug}`}
          className="btn-outline flex-1"
        >
          Get Quote
        </Link>
      </div>
    </article>
  );
}
