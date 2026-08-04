"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { isConversionPath } from "@/lib/layout";

/** High-intent conversion pages already surface WhatsApp/call CTAs inline
 *  (see components/booking/ConversionTrustPanel.tsx and the form success
 *  states) — the persistent floating buttons are dropped here to reduce
 *  competing CTAs on the exact pages a visitor is already converting on.
 *  Purely a `fixed`-position overlay toggle, so this never affects page
 *  layout/height on any route. Route list lives in lib/layout.ts, shared
 *  with Header so the two can't drift apart. */
export default function ConditionalFloatButtons({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isConversionPath(pathname)) return null;
  return <>{children}</>;
}
