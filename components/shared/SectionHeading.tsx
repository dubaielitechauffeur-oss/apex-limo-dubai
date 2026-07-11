interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

/** Consistent eyebrow + heading + subtitle pattern used to open every homepage section. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col ${alignment}`}>
      <span className="label-eyebrow">{eyebrow}</span>
      <div className="route-line-sm my-4" />
      <h2 className="font-display text-3xl text-ivory sm:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-sm leading-relaxed text-smoke sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
