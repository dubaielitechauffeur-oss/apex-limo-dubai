import type { Localized } from "@/lib/i18n-types";
import type {
  Timestamps,
  SoftDeletable,
  Publishable,
  Sluggable,
  Sortable,
} from "@/types/common";
import type { SeoFields } from "@/types/entities/seo";

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface PopularRouteEntity extends Timestamps, Sortable {
  id: string;
  locationId: string;
  destination: Localized;
  duration: Localized;
}

export interface LocationFaqEntity extends Timestamps, Sortable {
  id: string;
  locationId: string;
  question: Localized;
  answer: Localized;
}

export interface LocationEntity
  extends Timestamps,
    SoftDeletable,
    Publishable,
    Sluggable,
    Sortable {
  id: string;
  name: Localized;
  tagline: Localized;
  heroSubtitle: Localized;
  shortDescription: Localized;
  longDescription: Localized;
  isAirport: boolean;
  whyChoose: Localized<string[]>;
  landmarks: Localized<string[]>;
  tags: string[];
  imageId: string | null;
  heroDesktopImageId: string | null;
  heroMobileImageId: string | null;
  geo: GeoCoordinates;
  seo: SeoFields;
}
