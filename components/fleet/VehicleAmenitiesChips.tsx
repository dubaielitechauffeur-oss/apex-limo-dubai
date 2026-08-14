import {
  Wifi,
  GlassWater,
  Snowflake,
  EyeOff,
  Lightbulb,
  Sun,
  Baby,
  Gem,
  Sparkles,
  Briefcase,
  Coffee,
  BatteryCharging,
  Accessibility,
  BookOpen,
  Wine,
  Droplet,
  Check,
  type LucideIcon,
} from "lucide-react";

const AMENITY_META: Record<string, { icon: LucideIcon; label: string }> = {
  "wifi": { icon: Wifi, label: "Wi-Fi" },
  "water": { icon: GlassWater, label: "Water" },
  "refreshments": { icon: Coffee, label: "Refreshments" },
  "phone-charger": { icon: BatteryCharging, label: "Phone chargers" },
  "privacy-glass": { icon: EyeOff, label: "Privacy glass" },
  "child-seat": { icon: Baby, label: "Child seat" },
  "wheelchair-accessible": { icon: Accessibility, label: "Wheelchair access" },
  "leather-seats": { icon: Gem, label: "Nappa leather" },
  "panoramic-roof": { icon: Sun, label: "Panoramic roof" },
  "business-tables": { icon: Briefcase, label: "Business tables" },
  "reading-lights": { icon: BookOpen, label: "Reading lights" },
  "climate-zones": { icon: Snowflake, label: "Climate zones" },
  "ambient-lighting": { icon: Lightbulb, label: "Ambient lighting" },
  "reclining-seats": { icon: Sparkles, label: "Reclining seats" },
  "large-luggage": { icon: Briefcase, label: "Extra luggage" },
  "champagne-service": { icon: Wine, label: "Champagne service" },
  "bottled-mineral-water": { icon: Droplet, label: "Mineral water" },
};

/** Renders the admin-picked amenity chips on the vehicle detail page.
 *  Unknown keys (added to the DB but not yet mapped here) still render
 *  with a generic checkmark icon so nothing silently disappears. */
export function VehicleAmenitiesChips({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {amenities.map((key) => {
        const meta = AMENITY_META[key] ?? { icon: Check, label: key.replace(/-/g, " ") };
        const Icon = meta.icon;
        return (
          <li
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-white/5 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-sm"
          >
            <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} aria-hidden="true" />
            <span className="capitalize">{meta.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
