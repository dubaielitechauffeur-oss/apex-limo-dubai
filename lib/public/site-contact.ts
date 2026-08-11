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

/**
 * Serves contact details from `lib/constants.ts` — the database is not in
 * the read path, matching `lib/public/cms-content.ts`. Edit `SITE` and
 * deploy to change what customers see.
 *
 * The query below is kept, unused, so restoring admin-managed contact
 * details is a matter of calling it again rather than rewriting this file.
 */
export async function getSiteContact(): Promise<SiteContact> {
  return staticSiteContact();
}
