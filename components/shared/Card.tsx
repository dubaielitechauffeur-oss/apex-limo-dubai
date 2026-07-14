import { ElementType, HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** "dark" (default) — obsidian panel, for use on light sections as a
   *  focused module (forms, contact hubs) or on dark sections generally.
   *  "light" — ivory panel with a gold hairline, for content cards
   *  (service tiles, vehicle cards, testimonials) sitting on a light
   *  section, matching the parent background family. */
  tone?: "dark" | "light";
  /** Adds a hover border/background lift for interactive cards. */
  interactive?: boolean;
  /** Rendered element — defaults to "div"; use "article"/"figure" for semantic cards. */
  as?: ElementType;
}

const TONE_CLASSES: Record<"dark" | "light", string> = {
  dark: "border border-gold/15 bg-obsidian",
  light: "border border-gold/15 bg-ivory",
};

/**
 * Reusable bordered panel used for content cards, info panels, and stat
 * tiles across the site. See DESIGN_SYSTEM.md for tone guidance.
 */
export default function Card({
  children,
  tone = "dark",
  interactive = false,
  as: Tag = "div",
  className = "",
  ...props
}: CardProps) {
  const hoverClass = interactive
    ? "transition-colors duration-200 hover:border-gold/35"
    : "";

  return (
    <Tag className={`${TONE_CLASSES[tone]} ${hoverClass} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
