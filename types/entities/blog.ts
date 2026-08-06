import type { Localized } from "@/lib/i18n-types";
import type {
  Timestamps,
  SoftDeletable,
  Publishable,
  Sluggable,
  Sortable,
} from "@/types/common";
import type { SeoFields } from "@/types/entities/seo";

export type ContentBlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "image"
  | "faq"
  | "quote"
  | "code"
  | "embed";

export interface ContentBlock {
  type: ContentBlockType;
  content: Localized;
  metadata?: Record<string, unknown>;
}

export interface BlogCategoryEntity extends Timestamps, Sluggable, Sortable {
  id: string;
  name: Localized;
  description: Localized;
}

export interface BlogAuthor {
  name: string;
  title: string;
  email: string | null;
  avatarId: string | null;
}

export interface BlogPostEntity
  extends Timestamps,
    SoftDeletable,
    Publishable,
    Sluggable,
    Sortable {
  id: string;
  title: Localized;
  excerpt: Localized;
  content: ContentBlock[];
  author: BlogAuthor;
  categoryId: string | null;
  tags: string[];
  featuredImageId: string | null;
  seo: SeoFields;
  readingTimeMinutes: number;
}
