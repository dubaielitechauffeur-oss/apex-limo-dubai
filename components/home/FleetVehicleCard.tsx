import Image from "next/image";
import Link from "next/link";
import {
  Car,
  Users,
  Briefcase,
  UserCheck,
  Plane,
  Clock,
  CalendarDays,
  Wifi,
  GlassWater,
  BatteryCharging,
  Armchair,
  Snowflake,
  EyeOff,
  Tv,
  Sun,
  Gauge,
  Lightbulb,
  Sparkles,
  MessageCircle,
  Mail,
  Info,
  type LucideIcon,
} from "lucide-react";
import CTAButton from "@/components/shared/CTAButton";
import { SITE, getWhatsAppLink } from "@/lib/constants";
import type { FleetVehicle } from "@/data/fleet";

interface FleetVehicleCardProps {
  vehicle: FleetVehicle;
}

const AMENITY_ICON_RULES: [RegExp, LucideIcon][] = [
  [/chauffeur/i, UserCheck],
  [/wi-?fi/i, Wifi],
  [/water|champagne|welcome amenities/i, GlassWater],
  [/charg/i, BatteryCharging],
  [/leather|seat|quilted/i, Armchair],
  [/climate|air suspension/i, Snowflake],
  [/privacy|tint|curtain/i, EyeOff],
  [/luggage|bag/i, Briefcase],
  [/entertainment|screen|sound/i, Tv],
  [/light/i, Lightbulb],
  [/roof|headliner/i, Sun],
  [/suspension|ride/i, Gauge],
];

function amenityIcon(text: string): LucideIcon {
  const match = AMENITY_ICON_RULES.find(([pattern]) => pattern.test(text));
  return match ? match[1] : Sparkles;
}

interface SpecTile {
  icon: LucideIcon;
  label: string;
  value: string;
}

/**
 * At-a-glance booking facts rendered as the dashed tile strip. Built
 * from existing vehicle data plus service facts that hold fleet-wide
 * (chauffeur included, airport-ready, hourly/full-day hire) — no
 * pricing exists in the data model, so no rates are shown.
 */
function specTiles(vehicle: FleetVehicle): SpecTile[] {
  return [
    { icon: Users, label: "Passengers", value: String(vehicle.passengers) },
    { icon: Briefcase, label: "Luggage", value: `${vehicle.luggage} bags` },
    { icon: UserCheck, label: "Chauffeur", value: "Included" },
    { icon: Plane, label: "Airport", value: "Ready" },
    { icon: Clock, label: "Hourly", value: "Available" },
    { icon: CalendarDays, label: "Full Day", value: "Available" },
  ];
}

/**
 * Horizontal vehicle card for the homepage Fleet showcase — photograph
 * on the left, details on the right: category + name header with an
 * inclusions note and quick-contact icons, description, a dashed strip
 * of booking-fact tiles, a light amenity line, and the WhatsApp /
 * Email / Vehicle Details action row. Stacks image-over-content on
 * mobile. Distinct from components/fleet/VehicleCard.tsx (used on the
 * /fleet listing page), which keeps its existing layout unchanged.
 */
export default function FleetVehicleCard({ vehicle }: FleetVehicleCardProps) {
  const amenities = vehicle.features.slice(0, 6);
  const coverImage = vehicle.images?.exterior;
  const whatsappMessage = `Hello Apex Limo, I'd like to enquire about the ${vehicle.name}.`;
  const whatsappHref = getWhatsAppLink(whatsappMessage);
  const emailHref = `mailto:${SITE.email}?subject=${encodeURIComponent(
    `Enquiry: ${vehicle.name}`
  )}&body=${encodeURIComponent(
    `Hello Apex Limo,\n\nI'd like to enquire about booking the ${vehicle.name}.\n\n`
  )}`;

  return (
    <article className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gold/15 bg-ivory shadow-[0_20px_45px_-25px_rgba(10,10,10,0.35)] transition-shadow duration-300 hover:shadow-[0_28px_55px_-20px_rgba(10,10,10,0.4)] lg:grid-cols-[0.9fr_1.1fr]">
      {/* Image — top on mobile, left on desktop */}
      <div className="relative p-4 sm:p-5 lg:p-6 lg:pr-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal via-obsidian to-charcoal lg:aspect-auto lg:h-full lg:min-h-[340px]">
          {coverImage ? (
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 45vw, 480px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <Car className="h-16 w-16 text-gold/50" strokeWidth={1} aria-hidden="true" />
              <div className="route-line-sm" />
              <span className="text-[10px] uppercase tracking-widest text-smoke">
                Image Coming Soon
              </span>
            </div>
          )}
        </div>

        <span className="absolute left-8 top-8 inline-flex items-center rounded-full bg-gold px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-obsidian shadow-sm sm:left-9 sm:top-9">
          Chauffeur Included
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 sm:p-8">
        {/* Header row: category + name on the left, inclusions note + quick contacts on the right */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <span className="label-eyebrow text-[11px] text-gold-deep">{vehicle.category}</span>
            <h3 className="mt-1.5 font-display text-2xl text-obsidian sm:text-3xl">
              {vehicle.name}
            </h3>
          </div>

          <div className="flex items-start gap-3">
            <p className="max-w-[190px] text-right text-[11px] italic leading-snug text-graphite">
              Every journey includes a professional chauffeur, fuel &amp; Salik tolls.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp enquiry about the ${vehicle.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold-deep transition-colors duration-200 hover:border-gold hover:bg-gold/10"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <Link
                href={`/fleet/${vehicle.slug}`}
                aria-label={`More information about the ${vehicle.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-obsidian text-ivory transition-colors duration-200 hover:bg-charcoal"
              >
                <Info className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        <div className="my-5 h-px w-full bg-gold/25" />

        <p className="text-sm leading-relaxed text-graphite">{vehicle.description}</p>

        {/* Booking-fact tiles */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {specTiles(vehicle).map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-gold/35 px-1.5 py-3 text-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
                <Icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="text-[10px] uppercase tracking-wide text-graphite">{label}</span>
              <span className="text-xs font-semibold text-obsidian">{value}</span>
            </div>
          ))}
        </div>

        {/* Amenities — deliberately light */}
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {amenities.map((amenity) => {
            const Icon = amenityIcon(amenity);
            return (
              <span
                key={amenity}
                className="flex items-center gap-1.5 text-[11px] text-graphite/80"
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0 text-gold-deep/80"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {amenity}
              </span>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-obsidian/10 bg-ivory-off px-5 py-3 text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors duration-200 hover:bg-pearl"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            WhatsApp
          </a>
          <a
            href={emailHref}
            className="inline-flex items-center justify-center gap-2 bg-charcoal px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ivory transition-colors duration-200 hover:bg-obsidian"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Email
          </a>
          <CTAButton href={`/fleet/${vehicle.slug}`} className="flex-1">
            Vehicle Details
          </CTAButton>
        </div>
      </div>
    </article>
  );
}
