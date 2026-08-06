import type { Localized } from "@/lib/i18n-types";

export interface SeoFields {
  title: Localized;
  description: Localized;
  keywords: Localized<string[]>;
  ogImageId: string | null;
  canonical: string | null;
  noIndex: boolean;
  noFollow: boolean;
  structuredData: Record<string, unknown> | null;
}
