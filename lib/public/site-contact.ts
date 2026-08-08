import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

/**
 * Public read layer for the site's contact details (phone/WhatsApp/email) —
 * same database-first / static-fallback shape as `lib/public/cms-content.ts`,
 * kept in its own small file since `GlobalSettings` isn't "content" the way
 * Services/Locations/etc. are (no draft/publish workflow, no localization).
 *
 * Phase 11: before this, every public component imported `SITE` directly
 * (`lib/constants.ts`), so an admin editing `GlobalSettings.phone` in
 * `/admin/settings` changed nothing a customer saw. Server Components that
 * render contact info now call `getSiteContact()` and pass the result down
 * to any Client Component children that need it (same prop-passing
 * convention already used for `vehicles`/`services`/`locations`) — `SITE`
 * remains the fallback, never deleted, so a database outage degrades to
 * exactly today's static behavior rather than a blank/broken page.
 */
export interface SiteContact {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  /** Where booking/quote/contact form leads are sent internally — distinct
   *  from `email` (the public-facing address customers see/reply to).
   *  Static `SITE` has no separate notification address, so the fallback
   *  reuses `SITE.email`, matching exactly what `lib/notifications.ts`
   *  already sent to before this existed. */
  notificationEmail: string;
}

function staticSiteContact(): SiteContact {
  return { phone: SITE.phone, phoneDisplay: SITE.phoneDisplay, whatsapp: SITE.whatsapp, email: SITE.email, notificationEmail: SITE.email };
}

export async function getSiteContact(): Promise<SiteContact> {
  try {
    const row = await prisma.globalSettings.findFirst({
      select: { phone: true, phoneDisplay: true, whatsapp: true, email: true, notificationEmail: true },
    });
    if (!row || !row.phone || !row.whatsapp || !row.email) return staticSiteContact();
    return {
      phone: row.phone,
      phoneDisplay: row.phoneDisplay,
      whatsapp: row.whatsapp,
      email: row.email,
      notificationEmail: row.notificationEmail || row.email,
    };
  } catch (error) {
    console.error("[public/site-contact] database query failed, falling back to static SITE constant:", error);
    return staticSiteContact();
  }
}
