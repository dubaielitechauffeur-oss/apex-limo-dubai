import type { Localized } from "@/lib/i18n-types";
import type {
  Timestamps,
  SoftDeletable,
  Publishable,
  Sluggable,
  Sortable,
} from "@/types/common";
import type { SeoFields } from "@/types/entities/seo";

export interface ServiceFaqEntity extends Timestamps, Sortable {
  id: string;
  serviceId: string;
  question: Localized;
  answer: Localized;
}

export interface ServiceEntity
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
  benefits: Localized<string[]>;
  whyChoose: Localized<string[]>;
  ratingMetric: Localized;
  tags: string[];
  imageId: string | null;
  seo: SeoFields;
}
