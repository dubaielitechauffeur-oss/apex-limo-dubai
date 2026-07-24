"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BlogPost } from "@/data/blog";
import BlogCard from "./BlogCard";

interface BlogSearchProps {
  posts: BlogPost[];
  /** Precomputed server-side (see lib/blogImage.ts), keyed by slug — this component never touches the filesystem itself. */
  imageExistsBySlug: Record<string, boolean>;
}

/** Client-side search + grid for the /blog listing page — filters on title and excerpt only, no backend involved. */
export default function BlogSearch({ posts, imageExistsBySlug }: BlogSearchProps) {
  const [query, setQuery] = useState("");

  const visiblePosts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(trimmed) || post.excerpt.toLowerCase().includes(trimmed)
    );
  }, [posts, query]);

  return (
    <div>
      <div className="relative mx-auto max-w-xl">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles..."
          aria-label="Search blog articles by title or excerpt"
          className="w-full rounded-full border border-gold/20 bg-ivory py-4 pl-12 pr-6 text-sm text-obsidian placeholder:text-graphite outline-none transition-colors duration-200 focus:border-gold-deep"
        />
      </div>

      <div aria-live="polite">
        {visiblePosts.length > 0 ? (
          <div
            className={`mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gold/15 bg-gold/15 ${
              visiblePosts.length >= 2 ? "sm:grid-cols-2" : ""
            } ${visiblePosts.length >= 3 ? "lg:grid-cols-3" : ""}`}
          >
            {visiblePosts.map((post) => (
              <BlogCard key={post.slug} post={post} imageExists={imageExistsBySlug[post.slug] ?? false} />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center text-sm text-graphite">
            No articles match &ldquo;{query}&rdquo;. Try a different search term.
          </p>
        )}
      </div>
    </div>
  );
}
