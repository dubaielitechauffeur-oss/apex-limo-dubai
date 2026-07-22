import Image from "next/image";
import { Users, Briefcase, BadgeCheck, Car } from "lucide-react";
import type { FleetVehicle } from "@/data/fleet";

interface VehicleSummaryCardProps {
  vehicle: FleetVehicle;
}

/** Luxury vehicle summary shown above the quote form when arriving via ?vehicle=. */
export default function VehicleSummaryCard({ vehicle }: VehicleSummaryCardProps) {
  const cover = vehicle.images?.exterior;

  return (
    <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-[rgba(201,161,74,0.2)] bg-[#111111] p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 sm:w-48">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="192px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-8 w-8 text-white/30" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">
          {vehicle.brand}
        </p>
        <h2 className="mt-1 font-display text-2xl text-white">{vehicle.name}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#B8B8B8]">
          {vehicle.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#999999]">
            <Users className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
            {vehicle.passengers} Passengers
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#999999]">
            <Briefcase className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
            {vehicle.luggage} Luggage
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#999999]">
            <BadgeCheck className="h-4 w-4 text-[#C9A14A]" strokeWidth={1.5} aria-hidden="true" />
            Chauffeur Included
          </span>
        </div>
      </div>
    </div>
  );
}
