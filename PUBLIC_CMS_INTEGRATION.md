# Public Site CMS Integration

Phase 8 documentation: connecting the public website to the Phase 7 CMS
without blank pages, broken SEO, broken localization, route changes, or
content loss. Read alongside `CMS.md` (the admin CMS this phase exposes
publicly), `DATABASE_ARCHITECTURE.md`, and `ARCHITECTURE.md`.

## Why this phase existed

Phase 7 built full CRUD for Services, Locations, FAQs, Blog, and Homepage
content, but deliberately did **not** wire the public site to it — every
CMS table was empty, and pointing live routes at empty tables would have
blanked the working site. Phase 8 closes that gap: it migrates the site's
real static content (`data/*.ts`) into the CMS tables, then connects public
pages to read from the database, with static data kept as a permanent
fallback rather than deleted.

## Architecture

```
STATIC SOURCE              CMS MODEL         PUBLIC PAGE/COMPONENT           FALLBACK
─────────────────────────────────────────────────────────────────────────────────────
data/services.ts       →   Service       →   /[locale]/services(/[slug])  →  static array
data/locations.ts      →   Location      →   /[locale]/locations(/[slug]) →  static array
data/faqs.ts +          →  Faq +         →   /[locale]/faqs               →  static getAllFaqs()
data/faqHub.ts             FaqCategory
data/blog.ts            →  BlogPost      →   /[locale]/blog(/[slug])      →  static array
data/testimonials.ts    →  Testimonial   →   components/home/Testimonials →  static TESTIMONIALS
data/brands.ts          →  Brand         →   components/home/BrandsShowcase → static BRANDS
(no static source)      →  HeroSlide     →   components/home/Hero.tsx     →  unchanged static hero
```

```
prisma/migrate-public-content.ts   One-time, idempotent content import
                                    (npm run db:migrate-content)

lib/public/cms-content.ts          Central public read layer — every export
                                    mirrors a data/*.ts function's name,
                                    arguments, and return shape, with a
                                    database-first / static-fallback body

lib/cms/revalidate.ts              revalidatePath() helpers called from
                                    CMS admin actions after a mutation

app/[locale]/{services,locations,  Public pages: swapped their data/*.ts
  faqs,blog}/*                     import for lib/public/cms-content.ts,
                                    added `await`, added
                                    `export const revalidate = 300`

app/sitemap.ts                     Now queries published CMS content
                                    (with the same static fallback) for
                                    services/locations/blog; Fleet stays
                                    static (no Fleet CMS exists)
```

## Content migration

`prisma/migrate-public-content.ts` (`npm run db:migrate-content`) reads the
real `data/*.ts` arrays and writes them into the CMS tables:

- **Services** (6) — full localized content, embedded FAQs become `Faq`
  rows with `serviceId` set and a category resolved via the same
  `SERVICE_CATEGORY_MAP` the FAQ hub already used.
- **Locations** (6) — full localized content, `popularRoutes` become
  `LocationPopularRoute` rows, embedded FAQs become `Faq` rows with
  `locationId` set and category `"locations"`.
- **FAQs** — the 100-entry FAQ hub (`data/faqHub.ts`'s `NEW_FAQS`, exported
  for the migration) and the 6 homepage FAQs (`data/faqs.ts`), each with
  the same category assignment `getAllFaqs()` already computed
  (`HOME_CATEGORY_ORDER` for the homepage six).
- **Blog posts** (6) — the full structured `content: BlogContentBlock[]`
  array (headings, paragraphs, lists, embedded FAQ blocks) is copied
  as-is, since the Prisma `content` column already supports that exact
  shape — nothing is lost even though the admin's own editor only *writes*
  paragraph blocks (see `CMS.md`).
- **Testimonials** (6) and **Brands** (7) — direct field-for-field copy.
- **Hero Slides** — **not migrated.** The homepage has one static hero
  section, not a slideshow, so there is no genuine "slides" data to
  import — see "Homepage Hero" below.

**Images.** Service/Location image fields use the legacy `imageUrl`/
`imageAlt` columns Phase 7 kept for exactly this purpose — no `MediaItem`
row needed. `BlogPost.featuredImageId` has no legacy URL column, so the
migration creates one `MediaItem` per unique blog image, reading its real
file size and pixel dimensions from `public/images/blog/*` and pointing
`url` at the existing static path (a "virtual import" row — the file
itself is untouched, still served by Next's static file handling, not the
Phase 6 upload pipeline).

**Idempotency.** Every entity is looked up by its natural key (slug, name,
or a content-based match for rows without one) before writing; existing
rows are left untouched, never overwritten. Running the script again is
safe and picks up anything not yet imported. Verified by running it three
times in a row during this phase: first run created 137 rows, the next two
created 0.

**Safety.** The script never deletes or resets anything, never touches
`Role`/`User`, and only ever creates rows that don't already exist by
natural key — an administrator's edits made after import are never
clobbered by a re-run.

## Public read layer (`lib/public/cms-content.ts`)

Every exported function has the **same name, arguments, and return shape**
as the `data/*.ts` function it replaces (e.g. `getAllServices(locale)`,
`getServiceBySlug(slug, locale)`), so wiring a page was a two-line change:
swap the import, add `await`.

Internally, each function:

1. Queries Prisma for `status: "published", deletedAt: null` rows (only
   the states a public route may ever show).
2. Resolves each `LocalizedText` JSON field to the requested locale, with
   automatic English fallback per field (`value[locale] || value.en`) —
   the exact idiom every `data/*.ts` file already uses.
3. Falls back to the original static function whenever the query throws
   (connection down, Prisma error) **or** returns zero rows (nothing
   migrated/available yet). Single-slug lookups fall back the same way if
   the slug isn't found in the database.

```
CMS/database unavailable   → run() throws        → catch → static data
CMS table empty            → run() resolves []    → isEmpty → static data
CMS query fails            → same as "unavailable"
CMS has incomplete locale  → per-field English fallback (not a full
  data for one field          static-data fallback — only that field
                               reads English instead of a blank string)
```

Draft, archived, and soft-deleted rows are excluded from
`fetchAllX()`'s `where` clause itself — they never reach the mapping step,
so there is no code path that can accidentally surface them, and direct
slug access (`getServiceBySlug("some-draft-slug", locale)`) 404s exactly
like an unknown slug. Verified by
`lib/public/__tests__/cms-content.integration.test.ts` (creates one draft,
one archived, and one soft-deleted row per content type and asserts none
of them appear in the list or by direct slug).

## Fallback behavior — worked example

If Postgres is unreachable, `getAllServices("en")` throws inside its
Prisma query, `withFallback`'s `catch` logs the error and calls
`staticGetAllServices("en")` from `data/services.ts` — the exact function
the page called before Phase 8. The page renders identically to how it did
pre-migration. No route returns a blank page, a 500, or missing metadata
because of a database outage; the worst case is that very-recent CMS edits
are temporarily invisible until the database recovers.

## Homepage Hero

`components/home/Hero.tsx` is unchanged this phase. The homepage's hero is
a single static section (title, subtitle, two fixed images), not a
carousel — there was no genuine "slides" content in `data/*.ts` to
migrate, and forcing the existing rich hero copy (an embedded `<brand>`
span, a live vehicle-count badge) into the generic `HeroSlide` shape would
have been exactly the kind of blind, risky replacement Phase 8's rules
forbid. `lib/public/cms-content.ts` still exposes `getHeroSlides(locale)`
(queries published `HeroSlide` rows, returns `[]` on any failure or if none
exist) — the Phase 7 admin UI can already create slides — but nothing
currently renders them. **Deferred, not broken:** wiring an actual
carousel onto `Hero.tsx` when there's real multi-slide content to show is
a self-contained follow-up that doesn't touch anything else in this phase.

## Localization

No second localization system. `lib/public/cms-content.ts` imports the
same `Locale` type from `@/i18n/routing` every other module uses, and its
`pickText`/`pickArray` helpers are the identical `value[locale] || value.en`
idiom already duplicated across every `data/*.ts` file. Verified in all
six locales via `lib/public/__tests__/cms-content-migrated.integration.test.ts`
(Arabic name resolution) and browser-tested for RTL rendering on
`/ar/locations/dubai-marina`, `/ar/services/airport-transfers`, `/ar/faqs`,
and `/ar/blog` — correct `dir="rtl"`, mirrored layout, translated content
throughout, no overflow.

## SEO

No SEO regression — verified before/after on representative pages:

- **Title/description/canonical**: unchanged shape, now sourced from
  CMS-backed data instead of the static array (identical values, since
  migration is a byte-for-byte copy of the same English/localized text).
- **hreflang**: all 6 locale alternates + `x-default`, unchanged (`lib/seo.ts`
  wasn't touched).
- **OpenGraph/Twitter**: unchanged.
- **JSON-LD**: `Service`/`Place`/`LocalBusiness`/`Article`/`FAQPage`/
  `BreadcrumbList` structured data all still emit correctly against the
  now-CMS-backed content (verified via curl against a running dev server —
  8 JSON-LD blocks present on a service detail page, `Article` type present
  on a blog post, breadcrumb entries correct).
- **404 robots**: unmatched slugs still resolve as real HTTP 404s with a
  `noindex` override, exactly as before.
- **Known pre-existing issue (not caused by this phase)**: 404 pages emit
  two `<meta name="robots">` tags (one `noindex` from the page's own
  `generateMetadata`, one `index, follow` that appears to come from
  metadata merging with the root layout). Confirmed present on
  `/fleet/[nonexistent]` too — a route with no Fleet CMS and therefore
  untouched by this phase — so this is a pre-existing metadata-merging
  quirk, not a Phase 8 regression. Worth a dedicated fix in a future
  SEO-focused pass; out of scope here since it isn't related to the CMS
  cutover and touching root layout metadata risks affecting every page.

## Sitemap

`app/sitemap.ts` now queries `getServiceSitemapEntries()`/
`getLocationSitemapEntries()`/`getBlogPostSitemapEntries()` (same
database-first/static-fallback pattern, filtered to
`published`+non-deleted+valid-slug rows only) instead of importing the raw
`SERVICES`/`LOCATIONS`/`BLOG_POSTS` arrays directly. Blog posts use the
CMS row's real `updatedAt`/`publishedAt` for `lastModified`. `FLEET`/
`FLEET_CATEGORY_SLUGS` and all static marketing pages are untouched (no
Fleet CMS exists). Verified: 288 URL entries generated, correct hreflang
alternates per entry, draft/archived/soft-deleted fixture rows excluded
(tested in `cms-content.integration.test.ts`).

## Caching & Revalidation

Two independent, standard layers — no custom cache-invalidation system:

1. **Time-based ISR**: every CMS-backed public page sets
   `export const revalidate = 300` — a stale page self-heals within 5
   minutes even if an admin action's revalidation call is ever missed.
2. **On-demand `revalidatePath()`**: every CMS admin action
   (`app/admin/(dashboard)/{services,locations,faq,blog,homepage}/actions.ts`)
   calls a helper from `lib/cms/revalidate.ts`
   (`revalidatePublicServices`/`revalidatePublicLocations`/
   `revalidatePublicFaqs`/`revalidatePublicBlog`/`revalidatePublicHomepage`)
   after a successful create/update/publish/unpublish/delete/restore,
   revalidating the affected public path in **all six locales** plus
   `/sitemap.xml` where relevant — so a publish is visible on the next
   request, not after a 5-minute wait.

**Why not `unstable_cache`**: it requires the Next.js server's incremental
cache store and throws when called outside it — including inside this
project's own Vitest suite, which runs `lib/public/cms-content.ts`
directly. Wrapping every query in it would have made the database-backed
code paths untestable (every test would silently exercise only the
fallback branch) for a caching benefit ISR + `revalidatePath` already
provide. Queries go straight to Prisma; freshness comes from the two
layers above instead.

## Media

Public CMS content only ever resolves image URLs from the Phase 6
`MediaItem`/legacy-URL pattern already established — no new upload path,
no direct file references outside that system. Blog featured images route
through the "virtual import" `MediaItem` rows the migration created (see
above); everything else uses the legacy `imageUrl` columns.

## Testing

- `lib/public/__tests__/cms-content.integration.test.ts` — draft/archived/
  soft-deleted exclusion from listings and direct slug access (real
  Postgres), plus sitemap-entry exclusion for the same fixture rows.
- `lib/public/__tests__/cms-content-fallback.test.ts` — 16 tests mocking
  `@/lib/db` to simulate every query throwing, and every query resolving
  with zero rows, asserting every exported function correctly falls back
  to its static-data equivalent (or to `[]` for Hero Slides, which have no
  static source).
- `lib/public/__tests__/cms-content-migrated.integration.test.ts` — 8 tests
  against the real migrated data: Arabic localization, legacy image URL
  passthrough, geo-coordinate mapping, landmark broadcast, FAQ hub
  categorization across general/service/location sources, and blog
  heading/list block preservation (not just paragraphs).
- Full existing suite (Phases 1–7) re-run and green — 271 tests total
  across 20 files.
- Also fixed two **pre-existing** bugs discovered while writing these
  tests: `lib/cms/{services,faq,blog}.ts`'s admin search-by-text (`q`
  filter) used `string_contains` on a `LocalizedText` JSON column without
  a `path`, which Prisma never matches for object-shaped JSON — the admin
  search box always returned zero results. Fixed by adding `path: ["en"]`
  to all three. Unrelated to the CMS cutover itself, but found via the
  Phase 8 test suite touching the same code paths and is a genuine,
  small, safe fix.

## Browser verification

Playwright against a running dev server, desktop (1440×900), mobile
(390×844), and Arabic desktop, across home/services list+detail/locations
list+detail/faqs/blog list+detail:

- Every route: HTTP 200, no horizontal overflow, no broken images, no
  page-level JS errors.
- The only console output was a pre-existing, unrelated `next-intl`
  formatting warning in `FleetCarousel` (present regardless of this
  phase — Fleet has no CMS integration) and the sandbox blocking an
  external Google Tag Manager request (expected in this environment, not
  an application bug).
- Confirmed real migrated content renders server-side via direct HTML
  inspection (not just screenshots, since this site's `Reveal` scroll
  animations don't fire during an automated full-page screenshot): service
  benefits/why-choose text, location landmarks/popular routes, FAQ hub
  entries, blog post structured content (18 heading elements, 100 list
  items on one post), and homepage testimonials/brand logos.
- Arabic RTL: mirrored layout, right-aligned translated text, correct
  `dir="rtl"`, no overflow, across location/service/FAQ/blog pages.

## Database changes

None beyond what Phase 7 already migrated — this phase is pure data
population (INSERTs via the migration script), not a schema change.
`npx prisma validate` passes; no new models, fields, or migrations were
needed.

## Rollback safety

- `data/*.ts` files are **untouched** — every static getter function
  (`getAllServices`, `getServiceBySlug`, etc.) still exists, still works,
  and is exactly what every public page falls back to. Nothing about this
  phase can be "rolled back" by breaking anything, because the previous
  code path never left.
- If CMS integration ever needs to be fully disabled, reverting the import
  lines in the ~10 touched page/component files (swap
  `@/lib/public/cms-content` back to `@/data/...`) restores the exact
  Phase 7 behavior with no data loss — the CMS content stays in the
  database, untouched, ready to re-enable later.
- The migration script is safe to re-run at any time; it only adds rows
  that don't already exist.

## Deferred / known limitations

- **Homepage Hero carousel** — see "Homepage Hero" above.
- **`data/servicesFaqs.ts`** (the 16-entry FAQ block scoped to the
  `/services` listing page) — not migrated. It doesn't map cleanly onto
  the single-parent `Faq` model (it's neither a general hub FAQ nor tied
  to one service), and inventing a new "page-scoped FAQ" concept wasn't
  justified for one static block. Still served from `data/servicesFaqs.ts`
  directly, unchanged.
- **Fleet** — no Fleet CMS exists (out of scope per Phase 7's boundary and
  this phase's brief); `/fleet/*` pages and the sitemap's fleet routes are
  fully static, unaffected by this phase.
- **Pre-existing double-robots-tag on 404 pages** — see "SEO" above.
- **Pre-existing FAQ/service/blog admin search bug** — see "Testing" above
  (fixed as part of this phase's hardening).

## Future extension points

- A real Homepage Hero carousel slots onto the already-built
  `getHeroSlides()`/admin `HeroSlideManager` once there's real multi-slide
  content to show.
- `data/servicesFaqs.ts` could migrate cleanly if/when the `Faq` model
  grows a "page scope" concept, or by treating it as its own small
  content block.
- Once the CMS is proven stable in real production use (admins actively
  editing content, not just the migrated snapshot), the static `data/*.ts`
  files could be formally deprecated — but per this phase's explicit
  rules, that decision and its own migration are left for a later phase,
  not made here.
