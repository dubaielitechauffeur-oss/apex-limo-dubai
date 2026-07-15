interface ApexLogoProps {
  /** "row" — icon beside the wordmark (header). "stacked" — icon above a
   *  centered wordmark (footer). "wordmark" — text only, no icon. */
  layout?: "row" | "stacked" | "wordmark";
  /** Shown under the wordmark divider when set; omit to hide it entirely. */
  tagline?: string;
  /** Icon + wordmark scale. "sm" fits a fixed-height nav row; "md" suits
   *  the footer's more generous vertical space. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Brand mark implemented from the "Apex Chauffeur Logo" design
 * (claude.ai/design project 92a77558-b802-42f2-9b92-27dcd475b338) —
 * a ringed "A" monogram, the APEX / CHAUFFEUR wordmark, a hairline
 * divider, and an optional tagline. Faithful to the source design's
 * proportions and its own accent color (#b68235, distinct from the
 * site's brighter UI gold — a deliberate heritage tone for the mark
 * itself); the heading font reuses the site's existing Cormorant
 * (`font-display`) rather than loading the design's Cormorant Garamond
 * separately, since the two are near-identical serif faces from the
 * same type family.
 */
export default function ApexLogo({
  layout = "row",
  tagline,
  size = "sm",
  className = "",
}: ApexLogoProps) {
  const accent = "#b68235";
  const showIcon = layout !== "wordmark";
  const isRow = layout === "row";

  const iconSize = size === "sm" ? 34 : 56;
  const nameSize = size === "sm" ? "text-sm" : "text-2xl";
  const taglineSize = size === "sm" ? "text-[9px]" : "text-xs";

  const icon = showIcon ? (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="47" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={accent} strokeWidth="0.75" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        className="font-display"
        style={{ fontSize: 46, fill: accent }}
      >
        A
      </text>
    </svg>
  ) : null;

  return (
    <div
      className={`flex items-center ${isRow ? "flex-row gap-3" : "flex-col gap-2"} ${className}`}
    >
      {icon}
      <div className="flex flex-col items-center">
        <div
          className={`font-display font-semibold leading-[1.15] tracking-[0.28em] text-ivory ${nameSize}`}
        >
          APEX
        </div>
        <div
          className={`-mt-0.5 font-display font-semibold leading-[1.15] tracking-[0.28em] text-ivory ${nameSize}`}
        >
          CHAUFFEUR
        </div>
        {tagline ? (
          <>
            <div className="my-2 h-px w-14" style={{ background: accent }} />
            <div
              className={`font-body tracking-[0.32em] ${taglineSize}`}
              style={{ color: accent }}
            >
              {tagline}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
