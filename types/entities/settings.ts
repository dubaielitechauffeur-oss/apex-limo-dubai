import type { Localized } from "@/lib/i18n-types";
import type { Timestamps } from "@/types/common";

export interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  googleBusiness: string;
}

export interface FooterColumn {
  heading: Localized;
  links: FooterLink[];
}

export interface FooterLink {
  label: Localized;
  href: string;
}

export interface FooterSettings {
  copyrightText: Localized;
  columns: FooterColumn[];
}

export interface CompanySettingsEntity extends Timestamps {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: Localized;
  googleMapsUrl: string;
  socialLinks: SocialLinks;
  footer: FooterSettings;
  defaultCurrency: string;
  timezone: string;
}
