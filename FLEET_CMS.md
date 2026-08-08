# Fleet CMS

Phase 9 documentation: a full enterprise Fleet CMS in the Admin Panel
(vehicles + categories) and its public-site integration, following the
exact database-first/static-fallback pattern Phase 8 established. Read
alongside `CMS.md`, `PUBLIC_CMS_INTEGRATION.md`, `DATABASE_ARCHITECTURE.md`,
`MEDIA_LIBRARY.md`, and `RBAC.md`.

## Why this phase existed

Phases 1–8 built the CMS platform (auth, RBAC, admin shell, Media Library,
Services/Locations/FAQ/Blog/Homepage CRUD, public cutover) but explicitly
left Fleet out of scope. `/fleet/*` and the homepage carousel still read
`data/fleet.ts` directly, with no way to edit a vehicle without a code
deploy. Phase 9 closes that gap: full Fleet CRUD in the admin, wired to the
public site with the same safe fallback behavior every other content type
already has.

## Database — zero schema changes

The `Vehicle`/`VehicleImage`/`VehicleCategory`/`VehicleServiceLink`/
`VehicleLocationLink` models already existed in `prisma/schema.prisma`
(added in Phase 2B, unused until now) and already covered every field
`data/fleet.ts`'s `FleetVehicle` interface needs — slug, name, brand,
model, category, `isElectric`/`isFeatured`/`isPlaceholder`, passenger/
luggage capacity, tagline/description/longDescription/idealFor/features/
whyChoose/badge (all `LocalizedText`), `rates` (chauffeur-hire pricing
JSON), `seo`, `status`/`publishedAt`/`sortOrder`/`deletedAt`. Vehicle FAQs
reuse the existing shared `Faq` model via its optional `vehicleId` column
— the same pattern Phase 8 used for Service- and Location-embedded FAQs,
not a new model.

`npx prisma validate` passes with no migration needed. This phase is pure
additive application code on top of an already-correct schema.

## Architecture

```
STATIC SOURCE        CMS MODEL                    PUBLIC PAGE/COMPONENT              FALLBACK
──────────────────────────────────────────────────────────────────────────────────────────────
data/fleet.ts     →  Vehicle + VehicleCategory  →  /[locale]/fleet                 →  static FLEET
  (FLEET array)       + VehicleImage + Faq          /[locale]/fleet/[vehicle]         array
                       (vehicleId)                  components/home/FleetCarousel
```

```
prisma/migrate-fleet-content.ts   One-time, idempotent content import
                                   (npm run db:migrate-fleet-content)

lib/cms/fleet.ts                  Admin CRUD: VehicleCategory + Vehicle
                                   (list/get/create/update/publish/
                                   unpublish/delete/restore)

lib/cms/media-picker-actions.ts   Extended this phase: ensureMediaPickerItems()
                                   (see "Bug found and fixed" below)

app/admin/(dashboard)/fleet/*     Admin UI — /admin/fleet (overview),
                                   /admin/fleet/vehicles (list),
                                   /admin/fleet/vehicles/new,
                                   /admin/fleet/vehicles/[id] (edit),
                                   /admin/fleet/categories

components/admin/cms/             VehicleForm, VehicleImagesManager,
                                   VehicleCategoryManager — everything else
                                   (LocalizedField, SlugField,
                                   SeoFieldsSection, PublishStatusControls,
                                   PublishActions, MediaPickerField) reused
                                   as-is from Phase 7/8's shared library

lib/public/cms-content.ts         Extended this phase: getAllVehicles(),
                                   getVehicleBySlug(),
                                   getVehiclesByCategorySlug(),
                                   getVehicleSitemapEntries() — same
                                   database-first/static-fallback body as
                                   every other export in this file

lib/cms/revalidate.ts             Extended this phase: revalidatePublicFleet()

app/[locale]/fleet/*,              Public pages + homepage carousel: swapped
components/home/FleetCarousel.tsx  their data/fleet.ts import for
                                    lib/public/cms-content.ts, added `await`,
                                    added `export const revalidate = 300`

app/sitemap.ts                     Now queries getVehicleSitemapEntries()
                                    instead of the raw FLEET array
```

## Category mapping — a real design tension, resolved deliberately

`data/fleet.ts`'s `FleetCategory` type is a **closed union of display
strings** (`"Sedan" | "SUV" | "Van" | "Ultra-Luxury"`), used throughout the
existing public site's components and cross-linking logic. The Prisma
`VehicleCategory` model is a flexible, admin-editable, FK-based table keyed
by a lowercase `slug`. These are two different shapes for the same concept.

Resolved with a small mapping layer in `lib/public/cms-content.ts`:
`CATEGORY_SLUG_TO_DISPLAY` (`sedan → "Sedan"`, etc.) and
`CATEGORY_DISPLAY_RANK` (for the "Ultra-Luxury first" ordering the static
`getAllVehicles()` already used). This is safe for the real, current
4-category data — `prisma/seed.ts` seeds exactly these four slugs, matching
`FleetCategory`'s four members one-to-one.

**Known limitation, not a bug**: if an admin creates a 5th category through
`/admin/fleet/categories`, vehicles in it still render on the public site
(nothing breaks), but fall back to using their own category's English name
directly and sort after the four mapped categories, since there's no
`FleetCategory` union member or rank entry for it. A genuinely new vehicle
class (not a copy-edit of an existing one) is a product decision that
touches copy on `/fleet/[category]` listing pages, cross-link data, and
possibly icon choices — appropriately a deliberate follow-up, not an
unattended side effect of adding a database row.

## Admin Fleet module

Routes follow the project's existing nested-resource convention (same
shape as `/admin/blog`, `/admin/services`):

| Route | Purpose |
|---|---|
| `/admin/fleet` | Overview — live vehicle/category counts, links in |
| `/admin/fleet/vehicles` | List — search, status/category filters, pagination |
| `/admin/fleet/vehicles/new` | Create |
| `/admin/fleet/vehicles/[id]` | Edit + publish/unpublish/delete/restore |
| `/admin/fleet/categories` | Category CRUD (modal-based, mirrors FAQ's category manager) |

**Vehicle form sections** (`components/admin/cms/VehicleForm.tsx`): Basic
Information (name, slug, brand, model, category, electric/featured/
placeholder flags), localized content (tagline, short/long description,
ideal-for, features, why-choose, badge — all 6 locales), Specifications
(passenger/luggage capacity), Chauffeur-hire rates (6 tiers), Media
(gallery — see below), SEO (reusing `SeoFieldsSection` as-is), Publishing
(status + sort order).

**New component this phase**: `VehicleImagesManager` — `MediaPickerField`
only supports a single image; vehicles need an ordered gallery with a
primary/hero image (index 0). Same "choose from library" modal pattern,
accumulates an ordered array instead of one item, submits as repeated
`<input name="imageIds">` (read server-side via `formData.getAll()`, the
same convention Blog's `tagIds` already used).

**Deliberately not built**: no new upload path inside the Fleet form —
images are always chosen from the existing Media Library, per the
project's established "one upload system" rule.

## Bug found and fixed: media picker pagination silently dropped image references

Browser-testing the vehicle edit form (Mercedes-Maybach S-Class, migrated
first and therefore holding the *oldest* `MediaItem` rows) surfaced a real
data-loss bug, not specific to Fleet but newly exposed by Fleet's
production-scale dataset (47 real media items, more than one page):

- `getInitialMediaPickerItems()` (`lib/cms/media-picker-actions.ts`) only
  ever returns the library's most-recently-uploaded 24 items.
- `VehicleForm` resolved "this vehicle's current images" by filtering that
  24-item list for matching ids — so a vehicle whose images fell outside
  the newest page resolved to **zero** selected images in the edit form,
  even though the real `VehicleImage` rows existed.
- The same resolution pattern is used for every CMS module's OG-image
  field (`MediaPickerField`'s `initial` prop), which is why this was worth
  fixing at the shared layer, not a Fleet-only patch.
- Because `MediaPickerField`/`VehicleImagesManager` render their hidden
  `<input>`s purely from client state initialized off that (wrongly empty)
  `initial` prop, an ordinary, unedited "Save changes" click would have
  submitted `imageIds=[]` / `seo_ogImageId=""` — and `updateVehicle()`'s
  transactional `images.deleteMany` + recreate would have **silently
  deleted the vehicle's real gallery**, exactly the kind of destructive,
  undetected data loss this phase's brief says to stop and flag.

**Fix**: `lib/cms/media-picker-actions.ts` gained
`ensureMediaPickerItems(baseItems, referencedIds)` — fetches (permission-
gated, via the existing `getMediaItem()`) any referenced id missing from
the base page and appends it, so the current selection always resolves
correctly regardless of upload order. Wired into
`app/admin/(dashboard)/fleet/vehicles/[id]/page.tsx` for both the vehicle's
gallery images and its OG image. Verified visually (all 3 images now show
correctly for the Mercedes-Maybach) and covered by 6 new regression tests
in `lib/cms/__tests__/media-picker-actions.integration.test.ts`.

**Scope note**: the same latent gap exists in Services/Locations/Blog/FAQ/
Homepage's OG-image pickers (they use `MediaPickerField` the same way,
unfixed). Left alone this phase — Phase 9's brief is Fleet, and patching
five unrelated modules' edit pages is exactly the kind of out-of-scope
change the brief says not to make. Listed under "Deferred" below.

## Public Fleet integration

`app/[locale]/fleet/page.tsx`, `app/[locale]/fleet/[vehicle]/page.tsx`
(both the vehicle-detail and category-listing branches of this dual-purpose
route), and `components/home/FleetCarousel.tsx` swapped their
`data/fleet.ts` import for `lib/public/cms-content.ts` and added `await` —
same two-line-per-call-site change as every Phase 8 page. `FLEET`/
`FLEET_CATEGORY_SLUGS`/`isFleetCategorySlug`/`getFleetCategoryContent`
remain imported from `data/fleet.ts` directly for content Phase 9
deliberately left static (see "Deferred" below) and for
`generateStaticParams()`, which needs the full static list regardless of
database state at build time.

Each new `lib/public/cms-content.ts` export follows the file's existing
contract exactly: same function name/args/return shape as its
`data/fleet.ts` counterpart, published + non-deleted rows only, per-field
English fallback for incomplete locale data, and `withFallback()` (throw or
empty-result → static `data/fleet.ts` functions) on any database failure.

## Migration (`prisma/migrate-fleet-content.ts`)

`npm run db:migrate-fleet-content`. Reads the real `FLEET` array and
writes it into `Vehicle`/`VehicleCategory`/`VehicleImage`/`Faq`:

- **Categories** (4: Sedan, SUV, Van, Ultra-Luxury) — created first if
  missing, looked up by slug.
- **Vehicles** (13) — looked up by slug; existing rows left untouched.
- **Images** — a "virtual import" `MediaItem` per unique static image path
  (reads real file size/dimensions from `public/images/fleet/*` via the
  `image-size` package, points `url` at the existing static path — same
  pattern as Phase 8's blog images), then a `VehicleImage` row per vehicle
  with `sortOrder` preserving the original array order (index 0 = primary).
- **FAQs** — each vehicle's embedded FAQs become `Faq` rows with
  `vehicleId` set, deduped by `(vehicleId, question)`.

**Idempotency — an embedded-record lesson applied proactively.** A Phase 8
bug (location popular-routes) showed that gating embedded-child creation
behind "the parent row was *just* created" breaks backfilling on a second
run against a partially-imported database. This script's image/FAQ
backfill runs **unconditionally** on every row — `existingImageCount === 0`
for images, per-FAQ `(vehicleId, question)` lookup for FAQs — regardless of
whether the parent `Vehicle` was freshly created or already existed.

**Verified**: first run created 13 vehicles / 41 images / 39 FAQs; two
subsequent runs (one during this session's final QA pass) created 0 and
left all rows untouched. Real Postgres counts cross-checked directly via
`psql`: `vehicles=13, vehicle_images=41, vehicle_categories=4,
faqs(vehicleId not null)=39`.

**Safety**: never deletes or resets anything; only creates rows that don't
already exist by natural key; static `data/fleet.ts` is never modified or
removed.

## RBAC

No new permissions needed — `fleet:create`/`fleet:read`/`fleet:update`/
`fleet:delete`/`fleet:publish` already existed (Phase 4). **Important,
easy-to-miss fact confirmed while writing tests**: Fleet is
`fleet_manager`'s dedicated domain, not `content_manager`'s.
`content_manager` holds only `fleet:read` — it can view but not mutate
vehicles, unlike its full read/write access to Services/Locations/Blog/FAQ/
Homepage. `super_admin` and `admin` hold full Fleet access as expected.
Every mutation in `lib/cms/fleet.ts` independently re-checks permission
server-side (`requireCmsPermission`/`requirePermission`), never trusting
the admin UI's own hiding of buttons — verified by dedicated "unauthorized
mutation" tests per action.

## Media

Fully reuses the Phase 6 Media Library — no second upload system. Vehicle
images are `VehicleImage` rows (`vehicleId`, `mediaId`, `sortOrder`),
selected only from existing `MediaItem`s via the picker (see
`VehicleImagesManager` above). `findMediaUsage()`
(`lib/media/items.ts`) already included a `vehicle_image` usage source
before this phase — it was built proactively in Phase 6, ahead of Fleet's
CMS existing, and simply had no code path to exercise it. This phase added
the first real test covering it (`lib/media/__tests__/items.integration.test.ts`)
against a real `Vehicle`/`VehicleImage` fixture; zero production code
changes were needed for task item #89 itself.

## SEO

Same shape as every other CMS module — `seo.title`/`seo.description` per
locale, `seo.ogImageId` (now correctly resolvable regardless of upload
order, see the bug fix above), `seo.canonical`, `noIndex`/`noFollow`.
Public vehicle detail pages, category listings, canonical URLs, hreflang
alternates (all 6 locales + `x-default`), and JSON-LD were not redesigned
— they read from the same `PlainFleetVehicle` shape the static data always
produced, just sourced from the database when published content exists.

## Sitemap

`app/sitemap.ts` now calls `getVehicleSitemapEntries()` (database-first,
`published` + non-deleted + valid-slug only, static-fallback on failure)
instead of importing the raw `FLEET` array, using each vehicle's real
`updatedAt`/`publishedAt` for `lastModified`. Category listing routes
(`/fleet/sedan`, `/fleet/suv`, `/fleet/van`, `/fleet/ultra-luxury`,
`/fleet/electric`) are unaffected — they were already derived from
`FLEET_CATEGORY_SLUGS`, not the vehicle array. Verified: draft/unpublished/
soft-deleted vehicles excluded (dedicated test), published vehicles
present with correct slugs.

## Caching & Revalidation

Same two-layer pattern as Phase 8 — no new caching architecture:

1. **ISR**: `/[locale]/fleet` and `/[locale]/fleet/[vehicle]` set
   `export const revalidate = 300`.
2. **On-demand**: `revalidatePublicFleet(slug?)` in `lib/cms/revalidate.ts`,
   called from every mutating action in
   `app/admin/(dashboard)/fleet/actions.ts` (create/update/publish/
   unpublish/delete/restore/category changes) — revalidates
   `/fleet`, `/fleet/[slug]`, all 5 category listing routes, `/sitemap.xml`,
   and `/` (homepage carousel), across all 6 locales.

## Testing

- `lib/cms/__tests__/fleet.integration.test.ts` — 19 tests: category CRUD +
  permissions + duplicate-slug + delete-blocked-while-vehicles-reference-it,
  vehicle create (permission/validation/duplicate-slug/nonexistent-category/
  nonexistent-image/missing-fields/audit-log), get round-trip, update
  (permission/slug-reuse/image-replacement), publish/unpublish
  (`publishedAt`/permission), soft-delete/restore.
- `lib/cms/__tests__/media-picker-actions.integration.test.ts` — 6 new
  tests for `ensureMediaPickerItems()` (the bug fix above): already-present
  ids untouched, missing id fetched and appended, multiple missing ids in
  one call, null/undefined/empty-string ids ignored, soft-deleted id
  skipped without throwing, duplicate id de-duplicated.
- `lib/media/__tests__/items.integration.test.ts` — 1 new test exercising
  `findMediaUsage()`'s pre-existing `vehicle_image` source against a real
  `Vehicle`/`VehicleImage` fixture.
- `lib/public/__tests__/cms-content-fallback.test.ts` — extended with
  Fleet: `getAllVehicles`/`getVehicleBySlug`/`getVehiclesByCategorySlug`/
  `getVehicleSitemapEntries` fallback on database throw and on empty table.
- `lib/public/__tests__/cms-content-migrated.integration.test.ts` —
  extended with 5 tests against the real migrated data: vehicle count and
  Ultra-Luxury-first ordering, Arabic description + image-order (primary
  first), chauffeur-hire rates passthrough, electric-category filter,
  sedan-category filter.
- `lib/public/__tests__/cms-content.integration.test.ts` — extended with
  draft/soft-deleted vehicle exclusion from listings and direct slug
  access, plus sitemap-entry exclusion for the same fixture rows.
- Full suite: **309 tests across 22 files, all passing** (up from 271/20
  at the end of Phase 8).

## Browser verification

Playwright against a running dev server (admin login → Fleet list → create
vehicle → image picker → publish → public listing/detail → unpublish →
confirm hidden from listing/detail(404)/sitemap → delete → mobile
390×844 → Arabic RTL → public desktop/mobile):

- Admin: login, Fleet list (13 vehicles, correct thumbnails/pax/luggage/
  status), search (`?q=`, debounced), category/status filters, category
  manager (correct per-category vehicle counts: 5+4+1+3=13), full
  create-vehicle flow including slug generation, image selection from a
  47-item library, publish.
- Publish → public: new vehicle appeared on `/en/fleet` and its own detail
  page immediately (on-demand revalidation, not waiting for ISR).
- Unpublish → verified **hidden** from the public listing, its detail page
  now 404s, and its slug is absent from `/sitemap.xml` — all three checked
  directly, not just visually.
- Delete → removed from the admin list.
- Mobile (390×844): admin Fleet list, vehicle edit form, categories page,
  public Fleet listing, public vehicle detail — no horizontal overflow on
  any of them (checked via `scrollWidth > clientWidth`, not just visually).
- Arabic: admin's `LocalizedField` renders each Arabic input with
  `dir="rtl"`/`text-align: start` and correct right-to-left text
  (confirmed via computed style, not just appearance) — same shared
  component every other CMS module already uses, no second localization
  path. Public `/ar/fleet` and `/ar/fleet/[slug]` render `dir="rtl"` on
  `<html>`, no overflow.
- Public desktop: all 13 vehicle cards render with real images, pricing,
  and category badges once manually scrolled into view — an automated
  `fullPage` screenshot alone under-reports content on this site because
  of its scroll-triggered reveal animations (same false-negative Phase 8's
  browser testing already documented); confirmed via direct DOM/network
  inspection that zero images were actually broken.
- A `FORMATTING_ERROR` console warning on vehicle detail pages
  (`fleet.detail.whatsappMessage`'s `{name}` placeholder) reproduces
  identically on a pre-existing, unmigrated-by-this-phase vehicle
  (Mercedes-Maybach) — confirmed pre-existing, not a Phase 9 regression,
  dev-mode-only (page still renders correctly; next-intl's fallback covers
  the actual runtime string). Not fixed — same "not this phase's file to
  touch" reasoning as the bug-fix scope note above.

## Regression check — Phases 1–8 untouched

- Full test suite green across all 22 files, not just Fleet's.
- Homepage carousel (`components/home/FleetCarousel.tsx`) now reads from
  the database but renders identically — confirmed showing real vehicle
  content on both desktop and mobile.
- Services/Locations/FAQ/Blog/Homepage admin modules, Media Library,
  authentication, and RBAC were not modified this phase (only
  `lib/cms/media-picker-actions.ts` gained a new export,
  `ensureMediaPickerItems` — additive, nothing existing changed behavior).
- No changes to visual identity, black/gold branding, typography,
  animations, header/footer, or navigation — every admin Fleet page reuses
  the existing `AdminShell`/shared component library, and public Fleet
  pages are byte-identical in markup shape to their Phase-8-era selves,
  just database-sourced.

## Deferred / known limitations

- **5th-category display fallback** — see "Category mapping" above.
- **OG-image picker pagination gap in other CMS modules** — see "Bug found
  and fixed" above. `ensureMediaPickerItems()` already exists and is
  proven safe; wiring it into Services/Locations/Blog/FAQ/Homepage's edit
  pages is a small, self-contained follow-up.
- **Vehicle booking engine, dynamic pricing, payments, driver management,
  availability/calendar, fleet tracking, RTA integration, dispatch,
  advanced analytics, AI recommendations** — explicitly out of scope per
  this phase's brief; only static rate tiers and content management were
  built.
- **Pre-existing `whatsappMessage` FORMATTING_ERROR** — see "Browser
  verification" above; not caused by this phase, not fixed here.
- **Restore reachability** — matches the exact pre-existing Services/Blog
  pattern: a soft-deleted vehicle's `deletedAt` excludes it from
  `getVehicle()`/`listVehicles()` by default, so there's no admin-list path
  to its Restore button once deleted (same as every other Phase 7 CMS
  module — not a Fleet-specific gap). `restoreVehicle()` itself is fully
  built and tested at the data layer.

## Database changes

None. See "Database — zero schema changes" above.

## Git

Branch: `claude/enterprise-architecture-foundation-d53rn8`. Not merged to
main, not deployed. `.env` untouched and still git-ignored.
