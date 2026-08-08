# Phase 11 — Site-Wide Content Control, Pricing, SEO & Analytics

Documentation for the consolidated Phase 11 build-out: the admin panel's
remaining gaps (Homepage Hero, Pricing, SEO Manager, Analytics) plus a
site-wide fix so that editing `GlobalSettings` in the admin panel actually
changes what customers see. Read alongside `FLEET_CMS.md`,
`BOOKING_QUOTE_CMS.md`, `PUBLIC_CMS_INTEGRATION.md`, `RBAC.md`, and
`DATABASE_ARCHITECTURE.md`.

## Why this phase looked different

The user asked for a single consolidated pass to finish "whatever's
compulsory" for a usable admin panel, then personally add real vehicle
images/pricing through it. The audit (task #107) found that most of the
schema and admin scaffolding already existed — the real gap was almost
entirely **wiring**, not new data models:

- `HeroSlide` had a full CRUD admin UI (`HeroSlideManager.tsx`) and a
  fully-built public read function (`getHeroSlides()`), but **zero
  callers** — the homepage `Hero.tsx` was 100% static and never looked at
  either.
- `GlobalSettings.phone`/`whatsapp`/`email` had an admin form, but every
  public page imported the static `SITE` constant directly — an admin
  changing the phone number in `/admin/settings` changed nothing a
  customer saw.
- Pricing, SEO Manager, and Analytics were bare `ModulePlaceholder`
  screens with no backing code at all.
- "Chauffeur package" turned out not to be a separate entity — it's
  `Vehicle.rates`, already fully editable via the existing Fleet admin
  form (`VehicleForm.tsx`). No new schema.
- Mobile/desktop separate image upload was already built for `HeroSlide`
  and `Location` (`desktopImageId`/`mobileImageId` pairs + two
  `MediaPickerField`s each) — it just needed Hero to actually be wired to
  the public site to matter.

No Prisma migrations were needed anywhere in this phase — `npx prisma
validate` passes against the schema unchanged from Phase 9/10.

## What was built

### 1. Site-wide contact wiring (`lib/public/site-contact.ts`)

A new `getSiteContact()` — same database-first / static-fallback shape as
every `lib/public/cms-content.ts` read function, kept in its own file
since `GlobalSettings` has no draft/publish workflow or localization.
Falls back to the static `SITE` constant whenever the `GlobalSettings` row
doesn't exist yet, or has blank phone/whatsapp/email (the pre-first-save
state — `GlobalSettings` is a singleton never seeded by `prisma/seed.ts`).

```ts
export interface SiteContact {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  notificationEmail: string; // internal lead-notification target, distinct from the public `email`
}
```

Every public consumer of `SITE.phone`/`SITE.whatsapp`/`SITE.email` (~22
files: `Header`, `Footer`, `MobileNav`, `WhatsAppFloatButton`,
`CallFloatButton`, `ConstructionNoticeModal`, the contact page and form,
`FleetConciergeSection`, `BookingCTA`, every Fleet card/quote-form variant,
`BookingForm`/`QuoteForm`, locations/services detail JSON-LD, and the
privacy/terms legal text) now reads from `getSiteContact()` instead —
Server Components call it directly and pass the result down as a prop to
any Client Component children, matching the codebase's existing
prop-drilling convention (the same pattern already used for
`vehicles`/`services`/`locations`). `lib/notifications.ts`'s lead-email
`to:` address now uses `contact.notificationEmail` specifically (not the
public-facing `email`), preserving its exact prior behavior when
`GlobalSettings` has no separate value configured.

`lib/constants.ts`'s `getWhatsAppLink()`/`getPhoneLink()` gained optional
override parameters (`getWhatsAppLink(message?, whatsappNumber?)`) —
fully backward compatible, every existing call site keeps working
unchanged.

### 2. Homepage Hero wired to the public site (`components/home/Hero.tsx`)

`Hero.tsx` now calls `getHeroSlides(locale)` and uses the first published
slide (lowest `sortOrder`) when one exists, replacing the image (desktop
+ mobile via `<picture>`), title, subtitle, and up to two CTA buttons —
falling back to the original static markup when no slide has been
published. Trust indicators stay static (no matching field on
`HeroSlide`). CTA hrefs are checked for an external scheme (`https:`,
`tel:`, etc.) and rendered as a plain `<a>` when external, or the
locale-aware `Link` otherwise, since admin-entered hrefs aren't guaranteed
to be internal routes.

This is a single-slide override, not a carousel — the section has always
been one static banner, and `HeroSlideManager`'s multi-slide list manager
already existed for future use, but only the highest-priority published
slide drives the homepage today.

### 3. Pricing module (`lib/cms/fleet.ts`, `/admin/pricing`)

`Vehicle.rates` (`tenHours`/`fiveHours`/`oneHour`/`airport`/`extraHour`/
`additionalCity`, all AED) already existed and was already editable via
`VehicleForm.tsx`. Phase 11 adds a dedicated cross-vehicle editor so
pricing doesn't require opening each vehicle's full edit form one at a
time:

- `listVehicleRates()` / `updateVehicleRates(id, rates)` — new functions
  in `lib/cms/fleet.ts`, gated on the dedicated `pricing:read`/
  `pricing:update` permissions (not `fleet:*`) since this is the Pricing
  module's own surface, even though it shares the `Vehicle` row.
- `/admin/pricing` — a single table, one row per vehicle (grouped by
  category via the existing `sortOrder`), six always-editable number
  inputs per row, a per-row **Save** button (`PricingRateRow.tsx`, a
  client component using the same bound-Server-Action + `useTransition`
  pattern as `StatusTransitionControl.tsx`).
- These values are never rendered on the public site — confirmed via
  audit that every public rate tile already shows "Price on Request"
  deliberately, since confirmed pricing is always quoted per-trip on
  WhatsApp/quote request. This is an internal reference sheet, not a
  public price list.

### 4. SEO Manager (`lib/admin/settings.ts`, `lib/public/site-seo.ts`, `/admin/seo`)

`GlobalSettings.defaultSeo` reuses the exact `SeoMeta` shape every content
entity's own `seo` column already uses, so `/admin/seo` reuses the
existing `SeoFieldsSection` component as-is — no parallel form.
`updateDefaultSeo()` (added to `lib/admin/settings.ts`) validates via the
existing `seoMetaSchema` and creates the `GlobalSettings` row on first
save if none exists yet.

Unlike Pricing, this one genuinely needed a new public read path — a
site-wide default title/description/OG-image/robots directive is
meaningless if nothing ever reads it. `lib/public/site-seo.ts`'s
`getDefaultSeoOverride(locale)` (DB-first, static-fallback — returns
`null` when nothing's configured for that locale) is now consumed by the
root layout's `generateMetadata()` (`app/[locale]/layout.tsx`, already
`async`), which passes it into `getDefaultMetadata()` (`lib/seo.ts`).
**Every page that sets its own SEO (all of them today, via each page's
own `buildMetadata()` call) still wins** — this only ever surfaces as the
fallback for a route with no page-level override (verified against the
`not-found` page, which has none). Browser-verified: an admin-entered
default title correctly appeared as the 404 page's `<title>` while every
real content page's own title was untouched.

### 5. Analytics Dashboard (`lib/admin/analytics.ts`, `/admin/analytics`)

Real internal data — no placeholders:

- Booking/quote totals, status breakdowns (`groupBy` on `status`), and a
  30-day-vs-previous-30-day booking trend.
- Quote → booking conversion rate (`Quote.status = "converted"` share of
  total quotes).
- Top 5 most-booked vehicles (`groupBy` on `Booking.vehicleLabel`).
- Fleet/Services/Locations/Blog published-vs-total content counts.

**Website traffic analytics (sessions, page views, bounce rate) are
explicitly out of scope and documented as such in the page itself.**
Google Analytics is already live site-wide (`<GoogleAnalytics>` in the
root layout, tag `G-B37R3PW9NG`), but pulling its numbers into this
dashboard requires a GA4 Data API service-account credential this
environment doesn't have. `AnalyticsOverview.trafficAnalyticsAvailable`
is hard-coded `false` with a comment explaining why, rather than silently
omitting the section or faking numbers.

## Database changes

**None.** Every model this phase reads or writes (`HeroSlide`,
`GlobalSettings`, `Vehicle.rates`, `Booking`, `Quote`) already existed.

## Permission gating

All new/extended functions reuse existing permissions — no catalog or
seed changes:

| Function | Permission |
|---|---|
| `updateGlobalSettings` | `settings:update` |
| `updateDefaultSeo` | `seo:update` |
| `listVehicleRates` | `pricing:read` |
| `updateVehicleRates` | `pricing:update` |
| `getAnalyticsOverview` | `analytics:read` |

`fleet_manager` already had `pricing:*`; `seo_manager` already had
`seo:*`/`settings:*`; `booking_manager`/`viewer` already had
`analytics:read` — confirmed via `lib/permissions/roles.ts` before
building, so no role table needed to change.

## Testing

47 new Vitest tests (410 total, all passing):

- `lib/public/__tests__/site-contact.test.ts` — fallback on missing row,
  blank fields, and thrown errors; happy path; notification-email
  fallback to the public email.
- `lib/public/__tests__/site-seo.test.ts` — fallback on missing row, empty
  `defaultSeo`, blank title for the requested locale, and thrown errors;
  locale fallback to English; OG image URL resolution (including a
  deleted-media edge case).
- `lib/cms/__tests__/fleet.integration.test.ts` (extended) —
  `listVehicleRates`/`updateVehicleRates` permission gating, negative/
  non-finite rate rejection, persistence, and audit logging.
- `lib/admin/__tests__/settings.integration.test.ts` (new) —
  `getGlobalSettings`/`updateGlobalSettings`/`updateDefaultSeo` permission
  gating, validation, first-save row creation, and audit logging. Snapshots
  and restores the real `GlobalSettings` singleton row around the whole
  suite so it never leaves the dev database's actual settings altered.
- `lib/admin/__tests__/analytics.integration.test.ts` (new) — permission
  gating and data correctness against real fixture bookings/quotes.

## Manual verification

Browser-tested end to end against the local Postgres dev database
(Playwright + a real admin login):

- **Hero**: created a published `HeroSlide` directly in the database,
  confirmed the homepage picked it up (title, image, subtitle, CTA);
  deleted it, confirmed the static fallback returned exactly as before.
  Re-verified the static fallback path on mobile (`<picture>` swap) and
  in Arabic (RTL, translated copy) after the Hero.tsx changes.
- **Pricing**: edited a real vehicle's rate through `/admin/pricing`,
  confirmed the row persisted, confirmed an audit log entry was written,
  reverted the edit.
- **SEO Manager**: saved a default title/description through
  `/admin/seo`, confirmed the 404 page's `<title>` picked it up while a
  real content page's title stayed unchanged; cleared it afterward.
- **Analytics**: confirmed the zero-state renders cleanly with no
  bookings/quotes yet; seeded two confirmed bookings and one converted
  quote, confirmed the status bars, 100% conversion rate, and "Most
  Booked Vehicles" all updated correctly; cleaned up.
- **Fleet auto-behavior**: created a vehicle through the real
  `/admin/fleet/vehicles/new` form (not a raw DB insert), confirmed it
  appeared on `/fleet`, its category listing (`/fleet/sedan`), and got a
  working `/fleet/[slug]` detail page — all through the existing
  `revalidatePublicFleet()` wiring, no new code needed. (A `next dev`-only
  page-cache quirk made this look broken under a browser-automation
  check immediately after creation; a direct `curl` against the running
  server showed the new vehicle present all along, and `npm run build`
  — which prerenders all 105+ vehicle/category static params — completed
  with zero errors, confirming this was a verification-harness artifact,
  not a product bug.)
- **Regression sweep**: 20 public routes (desktop, mobile @390px, and
  Arabic RTL) and 18 admin routes all return 200 with zero console/page
  errors.

## Quality gates

`npx tsc --noEmit`, `npx eslint .`, `npx vitest run` (410/410), and
`npm run build` (324 static pages, all locales) all pass clean.

## Files touched

**New:**
- `lib/public/site-contact.ts`, `lib/public/site-seo.ts`
- `lib/admin/analytics.ts`
- `app/admin/(dashboard)/pricing/actions.ts`, `app/admin/(dashboard)/seo/actions.ts`
- `components/admin/pricing/PricingRateRow.tsx`
- `components/admin/seo/DefaultSeoForm.tsx`
- `components/admin/analytics/StatusBreakdown.tsx`
- Test files listed above under Testing.

**Extended:** `lib/cms/fleet.ts` (pricing functions), `lib/admin/settings.ts`
(`updateDefaultSeo`, extended from Phase 11's earlier settings work),
`lib/constants.ts` (`getWhatsAppLink`/`getPhoneLink` overrides), `lib/seo.ts`
(`getDefaultMetadata` override parameter).

**Rewired (contact + SEO):** `app/[locale]/layout.tsx`,
`components/layout/{Header,Footer,MobileNav,WhatsAppFloatButton,
CallFloatButton,ConstructionNoticeModal}.tsx`, `app/[locale]/contact/page.tsx`,
`components/contact/ContactForm.tsx`, `components/fleet/{FleetConciergeSection,
FleetListingCard,VehicleHeroQuoteForm}.tsx`, `components/home/{BookingCTA,
Hero,FleetCarousel,FleetCarouselClient,FleetCarouselCard}.tsx`,
`components/booking/{BookingForm,QuoteForm}.tsx`,
`app/[locale]/{booking,quote,fleet,fleet/[vehicle],locations/[location],
services,services/[service],privacy-policy,terms,about}/page.tsx`,
`lib/notifications.ts`.

**Rebuilt from placeholders:**
`app/admin/(dashboard)/{pricing,seo,analytics}/page.tsx`.

## Addendum — public chauffeur rates now displayed on the site

Originally every public rate tile (homepage carousel, `/fleet` listing,
and the vehicle detail page's "Available Chauffeur Packages") showed
"Price on Request"/"Custom Quote" regardless of `Vehicle.rates`, since the
seeded `Vehicle.rates` values were explicitly marked as sample/placeholder
figures ("added for layout review only... replace before treating as real
quotes" — `data/fleet.ts`), not confirmed pricing.

The user explicitly asked for real prices to be shown publicly. Flagged
the placeholder-data risk first (confirmed via the Pricing admin screen
that the live database still held the exact same sample numbers as the
static file); the user chose to ship the display code now and fill in
real rates via `/admin/pricing` afterward — **the numbers on the live site
are only accurate once every vehicle's rates have been updated there.**

- `lib/format.ts` gained `formatAedPrice(amount)` — `2500` → `"AED 2,500"`.
- `FleetCarouselCard.tsx`, `FleetListingCard.tsx`, and the vehicle detail
  page's package grid (mobile + desktop) now render each tier's real rate
  from `vehicle.rates`, wrapped in `<Ltr>` so the digits don't reverse
  under Arabic's RTL bidi algorithm (same pattern already used for phone
  numbers).
- A tier whose rate is still `0` (the un-priced default) falls back to
  the existing "Price on Request"/"Custom Quote" copy rather than
  rendering "AED 0" — so an unpriced vehicle degrades gracefully instead
  of looking broken.
- `VehicleHeroQuoteForm.tsx`'s "Price on Request" eyebrow (above the
  Request a Quote form, not tied to any single duration) was left
  unchanged — there's no single tier it could show.
- Browser-verified on the homepage carousel, `/fleet`, a vehicle detail
  page, and the Arabic RTL vehicle detail page — prices render correctly
  and stay left-to-right inside RTL text.

## Deferred (out of scope for this phase)

- **Website traffic analytics** (GA4 sessions/pageviews inside the admin
  dashboard) — needs a GA4 Data API service-account credential.
- **Payment gateway, driver management, WhatsApp Business API automation,
  customer-facing confirmation emails, CRM sync** — all pre-existing
  documented TODOs in `lib/notifications.ts`, untouched by this phase.
- A brand-new `VehicleCategory` slug outside the four hardcoded
  `FLEET_CATEGORY_SLUGS` (`sedan`/`suv`/`van`/`ultra-luxury`) still needs a
  matching entry in `data/fleet.ts` to get a working `/fleet/[category]`
  route — a known, pre-existing limitation documented in `FLEET_CMS.md`,
  not something this phase's "auto-category" scope required changing.
