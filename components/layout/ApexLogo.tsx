interface ApexLogoProps {
  /** "sm" fits the fixed-height header row; "md" suits the footer's more
   *  generous vertical space. */
  size?: "sm" | "md";
  /** Text alignment — "left" for the header, "center" for the footer's
   *  mobile (single-column) layout. */
  align?: "left" | "center";
  className?: string;
}

/**
 * Premium text-only brand wordmark — no icon, no logo image. "APEX" set in
 * a bold italic geometric display face (tight tracking, slanted), with a
 * small wide-tracked "LUXURY CHAUFFEUR" underneath. Pure white on the
 * header/footer's black background, per the brand redesign.
 */
export default function ApexLogo({ size = "sm", align = "left", className = "" }: ApexLogoProps) {
  const nameSize = size === "sm" ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl";
  const nameTracking = size === "sm" ? "tracking-[0.135em] sm:tracking-[0.02em]" : "tracking-[-0.02em] sm:tracking-[-0.04em]";
  const taglineSize = size === "sm" ? "text-[9px] sm:text-[10px]" : "text-[11px] sm:text-xs";
  const taglineTracking = size === "sm" ? "tracking-[0.14em] sm:tracking-[0.18em]" : "tracking-[0.22em] sm:tracking-[0.27em]";
  const taglineGap = size === "sm" ? "mt-1.5" : "mt-2.5";

  return (
    <div
      className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <span className={`font-logo font-black italic leading-none text-white ${nameSize} ${nameTracking}`}>
        APEX
      </span>
      <span
        className={`${taglineGap} font-body font-medium uppercase text-white ${taglineSize} ${taglineTracking}`}
      >
        Luxury Chauffeur
      </span>
    </div>
  );
}
