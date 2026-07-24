import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/data/blog";
import BlogImageFrame from "./BlogImageFrame";

interface BlogCardProps {
  post: BlogPost;
  /** Precomputed server-side (see lib/blogImage.ts) so this stays a plain, client-safe component. */
  imageExists: boolean;
}

/** Shared post card for the /blog listing grid and each detail page's "More From the Journal" rail. */
export default function BlogCard({ post, imageExists }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-ivory transition-colors duration-200 hover:bg-ivory-off"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-sm">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
          <BlogImageFrame
            image={post.featuredImage}
            exists={imageExists}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-8">
        <time dateTime={post.publishDate} className="text-xs uppercase tracking-wide text-graphite">
          {formatDate(post.publishDate)}
        </time>
        <h2 className="mt-3 font-display text-xl text-obsidian">{post.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite">{post.excerpt}</p>
        <span className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-wide text-gold-deep transition-colors duration-200 group-hover:text-obsidian">
          Read More
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
