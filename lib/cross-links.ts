/**
 * Hand-picked cross-references between fleet vehicles, services, and
 * locations, used to power the contextual "recommended" internal links on
 * the fleet, service, and location detail pages. Kept as a single source of
 * truth so the Fleet↔Services and Fleet↔Locations link pairs can't drift out
 * of sync with each other across the pages that render them.
 *
 * Pairings are grounded in each vehicle's existing `idealFor` positioning
 * (see data/fleet.ts) — e.g. the S-Class is already framed as the airport
 * transfer vehicle, the Phantom as the wedding vehicle tied to Palm
 * Jumeirah's resort weddings (see data/locations.ts).
 */

interface VehicleCrossLinks {
  serviceSlug: string;
  locationSlug: string;
}

export const VEHICLE_CROSS_LINKS: Record<string, VehicleCrossLinks> = {
  "mercedes-s-class": {
    serviceSlug: "airport-transfers",
    locationSlug: "dubai-international-airport-dxb",
  },
  "mercedes-v-class": {
    serviceSlug: "event-transportation",
    locationSlug: "downtown-dubai",
  },
  "bmw-7-series": {
    serviceSlug: "corporate-chauffeur",
    locationSlug: "business-bay",
  },
  "cadillac-escalade": {
    serviceSlug: "vip-transportation",
    locationSlug: "palm-jumeirah",
  },
  "range-rover-autobiography": {
    serviceSlug: "luxury-chauffeur",
    locationSlug: "dubai-marina",
  },
  "rolls-royce-phantom": {
    serviceSlug: "wedding-chauffeur",
    locationSlug: "palm-jumeirah",
  },
};

/** Vehicle slugs recommended for a given service (reverse lookup). */
export function vehiclesForService(serviceSlug: string): string[] {
  return Object.entries(VEHICLE_CROSS_LINKS)
    .filter(([, links]) => links.serviceSlug === serviceSlug)
    .map(([vehicleSlug]) => vehicleSlug);
}

/** Vehicle slugs recommended for a given location (reverse lookup). */
export function vehiclesForLocation(locationSlug: string): string[] {
  return Object.entries(VEHICLE_CROSS_LINKS)
    .filter(([, links]) => links.locationSlug === locationSlug)
    .map(([vehicleSlug]) => vehicleSlug);
}
