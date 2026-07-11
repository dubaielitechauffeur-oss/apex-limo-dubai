import Link from "next/link";
import { ReactNode } from "react";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
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
  icon,
  className = "",
  external = false,
}: CTAButtonProps) {
  const styles = variant === "solid" ? "btn-gold" : "btn-outline";

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
