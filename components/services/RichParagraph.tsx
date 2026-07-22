import Link from "next/link";

const LINK_PATTERN = /(\[[^\]]+\]\([^)]+\))/g;
const LINK_MATCH = /^\[([^\]]+)\]\(([^)]+)\)$/;

/**
 * Renders paragraph text containing hand-placed `[label](href)` markers as
 * real internal `<Link>`s. Keeps `data/services.ts` as plain, portable
 * strings (good for SEO and easy editing) while still letting a handful of
 * natural internal links live inline in the prose.
 */
export default function RichParagraph({
  text,
  className = "text-sm leading-relaxed text-graphite sm:text-base",
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(LINK_PATTERN);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        const match = part.match(LINK_MATCH);
        if (!match) return part;
        const [, label, href] = match;
        return (
          <Link
            key={index}
            href={href}
            className="text-gold-deep underline underline-offset-4 transition-colors duration-200 hover:text-obsidian"
          >
            {label}
          </Link>
        );
      })}
    </p>
  );
}
