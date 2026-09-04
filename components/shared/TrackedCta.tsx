"use client";

import { trackContactClick } from "@/lib/analytics";
import type { CtaPlacement } from "@/lib/analytics";

interface TrackedCtaProps {
  /** `wa.me` link or `tel:` URL. */
  href: string;
  channel: "whatsapp" | "phone";
  placement: CtaPlacement;
  /** Categorical context only — a vehicle or service name. Never customer data. */
  item?: string;
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

/**
 * A WhatsApp / phone anchor that reports its click to GA4 before handing off
 * to the external handler.
 *
 * Why a wrapper rather than an `onClick` on the existing anchors: the float
 * buttons, footer contact block and service/vehicle cards are all Server
 * Components that ship no JavaScript today. Adding a handler directly would
 * make each of those whole subtrees client components and push their markup
 * into the JS bundle. Isolating the handler here keeps everything around it
 * server-rendered — only this ~1 KB anchor is hydrated.
 *
 * `rel="noopener noreferrer"` is set for WhatsApp (a new tab); `tel:` links
 * stay in place, so they neither need it nor a target.
 *
 * The click is reported synchronously before navigation. `sendGAEvent` posts
 * via the GA tag's own transport, which uses `navigator.sendBeacon` for
 * exactly this case, so the event survives the page being unloaded.
 */
export default function TrackedCta({
  href,
  channel,
  placement,
  item,
  className,
  children,
  ...rest
}: TrackedCtaProps) {
  const isExternal = channel === "whatsapp";

  return (
    <a
      href={href}
      className={className}
      aria-label={rest["aria-label"]}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => trackContactClick(channel, placement, item)}
    >
      {children}
    </a>
  );
}
