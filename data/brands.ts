/**
 * Brand list for the homepage "Our Brands" badge carousel. Kept in sync
 * with the `brand` values used across data/fleet.ts — every brand shown
 * here has at least one vehicle in the fleet.
 */
export interface Brand {
  name: string;
  /** Short mark shown inside the circular badge — initials or a compact wordmark. */
  mark: string;
}

export const BRANDS: Brand[] = [
  { name: "Mercedes-Maybach", mark: "Maybach" },
  { name: "Mercedes-Benz", mark: "Mercedes-Benz" },
  { name: "Range Rover", mark: "Range Rover" },
  { name: "Rolls-Royce", mark: "RR" },
  { name: "BMW", mark: "BMW" },
  { name: "Bentley", mark: "Bentley" },
  { name: "GMC", mark: "GMC" },
  { name: "Cadillac", mark: "Cadillac" },
];
