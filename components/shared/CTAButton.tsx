import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";
import TrackedCta from "./TrackedCta";
import type { CtaPlacement } from "@/lib/analytics";

/** Classifies a CTA destination so WhatsApp/phone clicks can be counted as
 *  leads. Matching on the href rather than requiring every call site to pass a
 *  flag means a new WhatsApp button is tracked by construction, not by
 *  remembering to opt in. */
function contactChannelFor(href: string): "whatsapp" | "phone" | null {
  if (href.startsWith("tel:")) return "phone";
  if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) return "whatsapp";
  return null;
}

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
  /** Where this button sits, for GA4 placement reporting. Optional — an
   *  untagged contact CTA is still counted, just without a placement. */
  placement?: CtaPlacement;
  /** Categorical context (vehicle/service name) for the GA4 event. Never
   *  customer data. */
  trackingItem?: string;
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
  placement,
  trackingItem,
}: CTAButtonProps) {
  const base = variant === "solid" ? "btn-gold" : "btn-outline";
  const toneOverride = variant === "outline" && tone === "light" ? "text-obsidian" : "";
  const styles = `${base} ${toneOverride}`;

  // WhatsApp and phone CTAs are conversions on this site — most of the real
  // booking demand arrives through them rather than the forms — so they route
  // through the tracked anchor. Everything else stays a plain server-rendered
  // element with no client JS.
  const contactChannel = contactChannelFor(href);
  if (contactChannel) {
    return (
      <TrackedCta
        href={href}
        channel={contactChannel}
        placement={placement ?? "hero"}
        item={trackingItem}
        className={`${styles} ${className}`}
      >
        {icon}
        {children}
      </TrackedCta>
    );
  }

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
