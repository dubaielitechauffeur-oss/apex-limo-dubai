import type { Localized } from "@/lib/i18n-types";
import type { Timestamps, SoftDeletable, Sortable } from "@/types/common";

export type MediaType = "image" | "video" | "document";

export type ImageVariant = "desktop" | "mobile" | "thumbnail" | "og";

export interface MediaFolderEntity extends Timestamps, Sortable {
  id: string;
  name: string;
  parentId: string | null;
}

export interface MediaEntity extends Timestamps, SoftDeletable {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: Localized;
  caption: Localized | null;
  folderId: string | null;
  type: MediaType;
  variant: ImageVariant | null;
  url: string;
  uploadedById: string;
}
