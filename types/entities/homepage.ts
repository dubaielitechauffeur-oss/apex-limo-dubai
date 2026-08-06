import type { Localized } from "@/lib/i18n-types";
import type { Timestamps, Publishable, Sortable } from "@/types/common";

export type CTAButtonVariant = "primary" | "secondary" | "outline";

export interface HeroCTAButton {
  label: Localized;
  href: string;
  variant: CTAButtonVariant;
}

export interface HeroSlideEntity extends Timestamps, Publishable, Sortable {
  id: string;
  title: Localized;
  subtitle: Localized;
  desktopImageId: string;
  mobileImageId: string;
  ctaButtons: HeroCTAButton[];
}
