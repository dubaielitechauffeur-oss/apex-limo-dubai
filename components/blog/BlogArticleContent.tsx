import { ChevronDown } from "lucide-react";
import RichParagraph from "@/components/services/RichParagraph";
import type { BlogContentBlock } from "@/data/blog";

interface BlogArticleContentProps {
  blocks: BlogContentBlock[];
}

/** Renders a blog post's typed content blocks — headings, paragraphs, lists, and FAQ. */
export default function BlogArticleContent({ blocks }: BlogArticleContentProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag
              key={index}
              className={
                block.level === 2
                  ? "pt-4 font-display text-2xl text-obsidian sm:text-3xl"
                  : "pt-2 font-display text-xl text-obsidian sm:text-2xl"
              }
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <RichParagraph
              key={index}
              text={block.text}
              className="text-sm leading-relaxed text-graphite sm:text-base"
            />
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep"
                    aria-hidden="true"
                  />
                  <RichParagraph
                    text={item}
                    className="text-sm leading-relaxed text-graphite sm:text-base"
                  />
                </li>
              ))}
            </ul>
          );
        }

        // FAQ block — native <details>/<summary> keeps this interactive
        // without a client component, matching the same accordion pattern
        // used on the fleet and service detail pages.
        return (
          <div key={index} className="divide-y divide-obsidian/10 border-y border-obsidian/10">
            {block.items.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-lg text-obsidian marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-gold-deep transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        );
      })}
    </div>
  );
}
