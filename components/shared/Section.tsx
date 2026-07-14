import { HTMLAttributes, ReactNode } from "react";

export type SectionTone = "obsidian" | "ivory" | "linen" | "pearl" | "ink";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Background tone — see DESIGN_SYSTEM.md for when to use each. */
  tone?: SectionTone;
  /** Vertical padding: "lg" (default, 6rem) or "sm" (4rem) for denser pages. */
  padding?: "lg" | "sm";
  /** Thin gold hairline at the top of the section. Default true. */
  separator?: boolean;
}

const TONE_BG: Record<SectionTone, string> = {
  obsidian: "bg-obsidian",
  ivory: "bg-ivory",
  linen: "bg-linen",
  pearl: "bg-pearl",
  ink: "bg-ink",
};

/**
 * Standard full-width section wrapper: background tone, vertical rhythm,
 * and the gold hairline separator used throughout the site to mark a
 * tone change between adjacent sections.
 */
export default function Section({
  children,
  tone = "obsidian",
  padding = "lg",
  separator = true,
  className = "",
  ...props
}: SectionProps) {
  const paddingClass = padding === "sm" ? "py-section-sm" : "py-section";
  const separatorClass = separator ? "border-t border-gold/10" : "";

  return (
    <section
      className={`${separatorClass} ${TONE_BG[tone]} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
