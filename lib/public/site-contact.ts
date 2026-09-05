import { cache } from "react";
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
 * DB-first with static fallback. When admin edits GlobalSettings in
 * /admin/settings, the new phone/WhatsApp/email is served immediately
 * (paired with the settings action's revalidatePath calls). On DB error
 * or when GlobalSettings is unpopulated, falls back to `SITE` in
 * `lib/constants.ts` so the public site never breaks.
 *
 * Wrapped in React's `cache` so the whole render shares one query. This is
 * called from twenty-one places — the layout, most page bodies, the footer,
 * both floating call/WhatsApp buttons, the booking CTA, the fleet carousel —
 * and several of them are on screen together, so a single page view was
 * issuing the same query six or eight times. `cache` deduplicates them per
 * request; combined with the `select` below it turns roughly eight full-row
 * fetches per render into one narrow one.
 */
export const getSiteContact = cache(async function getSiteContact(): Promise<SiteContact> {
  try {
    // `select`, not the whole row. GlobalSettings also carries `address`,
    // `socialLinks`, `businessHours`, `footer`, `defaultSeo` and
    // `whatsappGreeting` — six JSON columns, most of them localized across six
    // locales — and none of them are read here. Fetching the full row shipped
    // all of that over the wire for five short strings.
    const row = await prisma.globalSettings.findFirst({
      select: {
        phone: true,
        phoneDisplay: true,
        whatsapp: true,
        email: true,
        notificationEmail: true,
      },
    });
    if (!row) return staticSiteContact();
    const fallback = staticSiteContact();
    return {
      phone: row.phone?.trim() || fallback.phone,
      phoneDisplay: row.phoneDisplay?.trim() || fallback.phoneDisplay,
      whatsapp: row.whatsapp?.trim() || fallback.whatsapp,
      email: row.email?.trim() || fallback.email,
      notificationEmail: row.notificationEmail?.trim() || row.email?.trim() || fallback.notificationEmail,
    };
  } catch (err) {
    console.error("[site-contact] DB read failed, using static fallback:", err);
    return staticSiteContact();
  }
});
