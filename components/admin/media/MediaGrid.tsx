import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { MediaCard } from "./MediaCard";
import type { MediaListItem } from "@/lib/media/items";

export function MediaGrid({ items }: { items: MediaListItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No media found"
        description="Upload a file or adjust your search/filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}
