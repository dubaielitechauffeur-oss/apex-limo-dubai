import Link from "next/link";
import Image from "next/image";
import { FileImage } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { formatFileSize, formatAdminDate } from "@/lib/admin/format";
import type { MediaListItem } from "@/lib/media/items";

const VARIANT_TONE = {
  original: "neutral",
  desktop: "info",
  mobile: "info",
  thumbnail: "neutral",
  og: "warning",
} as const;

export function MediaCard({ item }: { item: MediaListItem }) {
  const altText = item.alt.en || item.originalFilename;

  return (
    <Link
      href={`/admin/media/${item.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image src={item.url} alt={altText} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
      </div>
      <div className="space-y-1.5 p-3">
        <p className="truncate text-sm font-medium text-gray-900" title={item.originalFilename}>
          {item.originalFilename}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <span>{formatFileSize(item.sizeBytes)}</span>
          {item.width && item.height ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {item.width}×{item.height}
              </span>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{formatAdminDate(item.createdAt)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {item.variant ? <StatusBadge label={item.variant} tone={VARIANT_TONE[item.variant]} /> : null}
          {item.folderName ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              <FileImage className="h-3 w-3" aria-hidden="true" />
              {item.folderName}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
