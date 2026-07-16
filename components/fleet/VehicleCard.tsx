import { Users, Briefcase, Check } from "lucide-react";
import CTAButton from "@/components/shared/CTAButton";
import VehicleGallery from "./VehicleGallery";
import type { FleetVehicle } from "@/data/fleet";

interface VehicleCardProps {
  vehicle: FleetVehicle;
  /** "dark" (default) for use on a dark/obsidian section, "light" for a
   *  white/cream section. The gallery panel itself always stays dark —
   *  it's a self-contained "framed photograph" regardless of card tone. */
  tone?: "dark" | "light";
}

/** Full specification card for a single fleet vehicle, used on the fleet listing page. */
export default function VehicleCard({ vehicle, tone = "dark" }: VehicleCardProps) {
  const isLight = tone === "light";

  return (
    <article
      className={`flex flex-col border border-gold/15 p-6 transition-colors duration-200 hover:border-gold/35 ${
        isLight ? "bg-ivory" : "bg-charcoal"
      }`}
    >
      <VehicleGallery vehicle={vehicle} />

      <div className="mt-6 flex-1">
        <p className={`text-xs italic ${isLight ? "text-graphite" : "text-gold/90"}`}>
          {vehicle.tagline}
        </p>
        <h2 className={`mt-1 font-display text-2xl ${isLight ? "text-obsidian" : "text-heading"}`}>
          {vehicle.name}
        </h2>
        <p className={`mt-3 text-sm leading-relaxed ${isLight ? "text-graphite" : "text-smoke"}`}>
          {vehicle.description}
        </p>

        {/* Specs */}
        <div
          className={`mt-5 flex items-center gap-5 border-y py-4 text-xs ${
            isLight ? "border-obsidian/10 text-graphite" : "border-white/10 text-smoke"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className={`h-4 w-4 ${isLight ? "text-gold-deep" : "text-gold"}`} strokeWidth={1.5} />
            {vehicle.passengers} passengers
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className={`h-4 w-4 ${isLight ? "text-gold-deep" : "text-gold"}`} strokeWidth={1.5} />
            {vehicle.luggage} bags
          </span>
        </div>

        <p className={`mt-4 text-xs uppercase tracking-wide ${isLight ? "text-graphite" : "text-smoke"}`}>
          Ideal for{" "}
          <span className={isLight ? "text-gold-deep" : "text-gold"}>
            {vehicle.idealFor.toLowerCase()}
          </span>
        </p>

        {/* Features */}
        <ul className="mt-5 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {vehicle.features.map((feature) => (
            <li
              key={feature}
              className={`flex items-start gap-2 text-xs ${isLight ? "text-graphite" : "text-smoke"}`}
            >
              <Check
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isLight ? "text-gold-deep" : "text-gold"}`}
                strokeWidth={2}
              />
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
        <CTAButton
          href={`/quote?vehicle=${vehicle.slug}`}
          variant="outline"
          tone={tone}
          className="flex-1"
        >
          Get Quote
        </CTAButton>
      </div>
    </article>
  );
}
