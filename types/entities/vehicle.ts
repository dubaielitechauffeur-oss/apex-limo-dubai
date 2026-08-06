import type { Localized } from "@/lib/i18n-types";
import type {
  Timestamps,
  SoftDeletable,
  Publishable,
  Sluggable,
  Sortable,
} from "@/types/common";
import type { SeoFields } from "@/types/entities/seo";

export type VehicleCategorySlug =
  | "sedan"
  | "suv"
  | "van"
  | "ultra-luxury"
  | "electric";

export interface VehicleCategoryEntity extends Timestamps, Sluggable, Sortable {
  id: string;
  name: Localized;
  description: Localized;
}

export interface VehicleImageEntity extends Timestamps, Sortable {
  id: string;
  vehicleId: string;
  mediaId: string;
  alt: Localized;
  isPrimary: boolean;
}

export interface VehicleFaqEntity extends Timestamps, Sortable {
  id: string;
  vehicleId: string;
  question: Localized;
  answer: Localized;
}

export interface VehicleRatesEntity extends Timestamps {
  id: string;
  vehicleId: string;
  tenHours: number;
  fiveHours: number;
  oneHour: number;
  airport: number;
  extraHour: number;
  additionalCity: number;
  currency: string;
}

export interface VehicleEntity
  extends Timestamps,
    SoftDeletable,
    Publishable,
    Sluggable,
    Sortable {
  id: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  isElectric: boolean;
  passengers: number;
  luggage: number;
  tagline: Localized;
  description: Localized;
  longDescription: Localized;
  idealFor: Localized;
  features: Localized<string[]>;
  whyChoose: Localized<string[]>;
  badge: Localized | null;
  isPlaceholder: boolean;
  seo: SeoFields;
}
