import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { BlogImage } from "@/data/blog";

interface BlogImageFrameProps {
  image: BlogImage;
  /** Precomputed server-side via lib/blogImage.ts — this component never touches the filesystem itself, so it's safe in a client bundle. */
  exists: boolean;
  priority?: boolean;
  sizes?: string;
}

/**
 * Drop-in replacement for a `fill`-mode next/image: renders the real photo
 * when it exists, otherwise a branded placeholder showing exactly where to
 * add it and (if provided) the AI prompt it should be generated from. No
 * toggling needed — adding the file and rebuilding makes it render.
 */
export default function BlogImageFrame({ image, exists, priority, sizes }: BlogImageFrameProps) {
  if (exists) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-charcoal via-obsidian to-charcoal p-6 text-center">
      <ImageIcon className="h-8 w-8 text-gold/50" strokeWidth={1} aria-hidden="true" />
      <p className="text-[10px] uppercase tracking-wide text-smoke">Image pending</p>
      <p className="max-w-xs break-words text-[11px] text-smoke/80">{image.alt}</p>
      <p className="max-w-xs break-all font-mono text-[10px] text-gold/70">public{image.src}</p>
    </div>
  );
}
