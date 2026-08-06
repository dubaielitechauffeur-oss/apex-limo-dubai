import type { Localized } from "@/lib/i18n-types";
import type { Timestamps, Publishable, Sortable } from "@/types/common";

export type PricingCategory =
  | "airport_transfer"
  | "hourly"
  | "daily"
  | "package";

export interface PricingTierEntity extends Timestamps, Sortable {
  id: string;
  vehicleId: string;
  category: PricingCategory;
  name: Localized;
  amount: number;
  currency: string;
  unit: string;
  isActive: boolean;
}

export interface PricingPackageEntity extends Timestamps, Publishable, Sortable {
  id: string;
  name: Localized;
  description: Localized;
  vehicleIds: string[];
  basePrice: number;
  currency: string;
  duration: string;
  inclusions: Localized<string[]>;
}
