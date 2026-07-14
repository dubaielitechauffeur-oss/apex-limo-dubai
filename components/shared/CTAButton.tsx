import Link from "next/link";
import { ReactNode } from "react";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  /** "dark" (default) for use on a dark section, "light" for the outline
   *  variant on a white/cream section (fixes its text color, which
   *  otherwise defaults to ivory and is invisible on light backgrounds). */
  tone?: "dark" | "light";
  icon?: ReactNode;
  className?: string;
  external?: boolean;
}

/**
 * Primary call-to-action button used for "Book Now", "WhatsApp Us",
 * and "Get Instant Quote" across the site. Renders an internal Next.js
 * Link for local routes, or a plain anchor for external/WhatsApp links.
 */
export default function CTAButton({
  href,
  children,
  variant = "solid",
  tone = "dark",
  icon,
  className = "",
  external = false,
}: CTAButtonProps) {
  const base = variant === "solid" ? "btn-gold" : "btn-outline";
  const toneOverride = variant === "outline" && tone === "light" ? "text-obsidian" : "";
  const styles = `${base} ${toneOverride}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles} ${className}`}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${styles} ${className}`}>
      {icon}
      {children}
    </Link>
  );
}
