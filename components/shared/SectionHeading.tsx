interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  /** "dark" (default) for sections on a black background, "light" for
   *  sections on a white/cream background — swaps text colors so
   *  everything stays readable. */
  tone?: "dark" | "light";
}

/** Consistent eyebrow + heading + subtitle pattern used to open every homepage section. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
  const eyebrowColor = tone === "light" ? "text-graphite" : "";
  const dividerColor = tone === "light" ? "bg-gold-deep" : "";
  const titleColor = tone === "light" ? "text-obsidian" : "text-heading";
  const subtitleColor = tone === "light" ? "text-graphite" : "text-smoke";

  return (
    <div className={`flex max-w-2xl flex-col ${alignment}`}>
      <span className={`label-eyebrow ${eyebrowColor}`}>{eyebrow}</span>
      <div className={`route-line-sm my-4 ${dividerColor}`} />
      <h2 className={`font-display text-3xl sm:text-4xl ${titleColor}`}>{title}</h2>
      {subtitle ? (
        <p className={`mt-4 text-sm leading-relaxed sm:text-base ${subtitleColor}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
