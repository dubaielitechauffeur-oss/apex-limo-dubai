/**
 * Brand list for the homepage "Our Brands" badge carousel. Kept in sync
 * with the `brand` values used across data/fleet.ts — every brand shown
 * here has at least one vehicle in the fleet.
 *
 * Logo files in public/images/brands/ are sourced from the MIT-licensed
 * `car-brand-logos` npm package (see LICENSE-car-brand-logos.txt in that
 * folder) — used here purely to identify which manufacturers are
 * represented in the fleet, not to imply endorsement by those brands.
 */
export interface Brand {
  name: string;
  logo: string;
}

export const BRANDS: Brand[] = [
  { name: "Mercedes-Maybach", logo: "/images/brands/mercedes-maybach.png" },
  { name: "Mercedes-Benz", logo: "/images/brands/mercedes-benz.svg" },
  { name: "Range Rover", logo: "/images/brands/range-rover.svg" },
  { name: "Rolls-Royce", logo: "/images/brands/rolls-royce.svg" },
  { name: "BMW", logo: "/images/brands/bmw.svg" },
  { name: "Bentley", logo: "/images/brands/bentley.svg" },
  { name: "GMC", logo: "/images/brands/gmc.png" },
  { name: "Cadillac", logo: "/images/brands/cadillac.png" },
];
