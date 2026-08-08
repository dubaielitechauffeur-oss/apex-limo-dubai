# Content Management System (CMS)

Phase 7 documentation: the CMS built inside the existing Admin Panel for
Services, Locations, FAQs, Blog, and Homepage content (Hero Slides,
Testimonials, Brands). Read alongside `ADMIN_PANEL.md` (admin shell/
components this reuses), `RBAC.md` (permission model), `MEDIA_LIBRARY.md`
(the media picker this integrates with), and `DATABASE_ARCHITECTURE.md`
(schema this phase implements against, and one deliberate divergence noted
below).

## Scope of this phase

Built: full CRUD for Services, Locations, FAQ categories/entries, Blog
categories/tags/posts, and Homepage content (Hero Slides, Testimonials,
Brands) — all permission-gated, audit-logged, localized where the schema
supports it, and integrated with the Phase 6 Media Library as the only
image source. Also built: read-only, unauthenticated query functions
proving published CMS content is safe for public pages to consume, without
actually cutting any live public page over to the database yet (see
"Public Site Integration" below for why).

Not built (explicit phase boundary): Fleet CMS, Pricing/quotes CMS,
Settings editor beyond what Phase 5 already has, an advanced rich-text
editor (see "Blog post content" below), automatic image derivatives.

## Architecture

```
lib/cms/
  guard.ts               requireCmsPermission() — same DB-fresh,
                          non-throwing gate pattern as lib/media/guard.ts
  localized.ts            LocalizedText, localizedTextSchema, emptyLocalizedText(),
                          readLocalizedField(), LOCALE_LABELS
  seo.ts                   SeoMeta, seoMetaSchema, emptySeoMeta(), readSeoField()
  slug.ts                  slugify(), isValidSlug()
  media-picker-actions.ts  "use server" — searchMediaForPicker(),
                          getInitialMediaPickerItems() (wrap lib/media/items.ts)
  services.ts              Service CRUD
  locations.ts             Location CRUD + popular routes
  faq.ts                   FaqCategory + Faq CRUD
  blog.ts                  BlogCategory + Tag + BlogPost CRUD
  homepage.ts               HeroSlide + Testimonial + Brand CRUD
  __tests__/               Integration tests (real Postgres, mocked session)

components/admin/cms/
  LocalizedField.tsx       6-locale field grid, dir="rtl" on Arabic
  MediaPickerField.tsx      Modal "choose from library" — the only image UI
  SlugField.tsx             Text input + "Generate from title" button
  SeoFieldsSection.tsx      Localized title/description + OG image + canonical + noindex/nofollow
  PublishStatusControls.tsx PublishStatusBadge, PublishStatusSelect
  PublishActions.tsx        Publish/Unpublish/Archive/Delete/Restore action bar
  ServiceForm.tsx / LocationForm.tsx / BlogPostForm.tsx / FaqForm.tsx
  PopularRoutesManager.tsx  Location popular-routes sub-CRUD
  FaqCategoryManager.tsx / FaqDeleteButton.tsx
  BlogTaxonomyManager.tsx   Blog categories + tags combined sidebar
  HeroSlideManager.tsx / TestimonialManager.tsx / BrandManager.tsx  Modal-based CRUD

app/admin/(dashboard)/{services,locations,faq,blog}/
  page.tsx                 List (search/filter/paginate)
  new/page.tsx              Create
  [id]/page.tsx              Edit + publish/delete/restore
  actions.ts                 "use server" wrappers, no authorization logic
                            of their own (CmsActionState defined once in
                            services/actions.ts, imported everywhere else)

app/admin/(dashboard)/homepage/
  page.tsx                  Single page combining all three managers
  actions.ts

lib/public/cms-content.ts   getPublishedServices/Locations/BlogPosts() —
                            read-only, unauthenticated, published+non-deleted
                            only. NOT wired into any public page yet.
```

No second admin layout, sidebar, or permission system was created. Every
list/detail page sits under the existing `(dashboard)` layout and reuses
`PageHeader`, `Card`, `Table`, `FormField`, `Toast`, `ConfirmDialog`, `Modal`
from Phase 5's component library.

## CRUD pattern (Services, Locations, Blog)

These three modules share one shape, since their schemas (slug, status,
soft-delete, SEO, localized fields) are near-identical:

1. **List** — search (`q`), status filter, pagination; excludes
   soft-deleted rows unless `includeDeleted` is passed.
2. **Create/Edit form** — `LocalizedField` for every `Json` localized column,
   `SlugField`, `MediaPickerField` for image relations, `SeoFieldsSection`,
   a `PublishStatusSelect`.
3. **Detail/edit page** — the form plus a `PublishActions` bar (Publish /
   Unpublish / Archive / Delete / Restore).
4. Every mutation independently calls `requireCmsPermission()`, validates
   slug format/uniqueness, and writes an `AuditLog` entry.

**Array-shaped fields** (`benefits`, `landmarks`, `whyChoose`, `tags` on
Service/Location; `content` on BlogPost) are edited as plain text in the
admin form — one line per array item, or blank-line-separated paragraphs for
long-form text — and converted to/from the underlying `Json` array on
read/write (`linesToArray`/`arrayToLines`/`paragraphsToArray`/
`arrayToParagraphs` in each module). This keeps forms simple without adding
a list-builder UI component the brief didn't ask for.

FAQ and Homepage content (Hero Slides, Testimonials, Brands) get lighter,
more tailored treatment below, matching their simpler/different schemas.

## FAQ CMS

`FaqCategory` (keyed by `key`, not `slug`) and `Faq` entries are managed
from one page (`/admin/faq`): a category sidebar (`FaqCategoryManager`,
modal-based CRUD) plus a paginated FAQ list. Neither model has a
`PublishStatus` or `deletedAt` in the schema, so there is no publish
workflow here — creation is immediate and deletion is a real hard delete
(`FaqDeleteButton`, not the shared `PublishActions` bar).

**Single-parent constraint.** A `Faq` may be scoped to at most one of
`vehicleId`/`serviceId`/`locationId` (or none, for a general FAQ) —
enforced at the database level by the `faqs_single_parent_check` CHECK
constraint from the original schema migration. `validateSingleParent()` in
`lib/cms/faq.ts` mirrors that same rule in application code before the
query ever reaches Postgres, so the admin gets a clean validation error
instead of a raw constraint-violation. The DB constraint itself is still
tested directly (`lib/cms/__tests__/faq.integration.test.ts`) as defense in
depth. The FAQ form's scope picker (`FaqForm`) offers vehicle/service/
location dropdowns via `listFaqParentOptions()` — the vehicle list is
currently always empty since Fleet CMS doesn't exist yet (documented, not a
bug).

## Blog CMS

`BlogCategory` (slug-based) and `Tag` (simple, no ordering) are managed via
`BlogTaxonomyManager`. `BlogPost` gets full list/create/edit pages with
slug, localized title/excerpt, category, tag assignment, featured image
(via `MediaPickerField`), author (`{name, title: LocalizedText, email?}`),
reading time, SEO fields, and draft/published/archived status with
soft-delete.

**Blog post content.** `BlogPost.content` is stored as `BlogContentBlock[]`
— the same typed block shape (`heading`/`paragraph`/`list`/`faq`) the
static `data/blog.ts` posts already use, so nothing about the column
changes. Per the Phase 7 brief ("do not build an advanced rich-text editor
unless the existing architecture already contains one"), the admin form
only creates `paragraph` blocks: a single textarea, split into one block
per blank-line-separated paragraph (`textToParagraphBlocks`/
`blocksToText`). **Limitation:** heading/list/FAQ blocks aren't creatable or
editable through this admin UI — a post authored elsewhere with those block
types would have them silently dropped if re-saved through this form. A
richer block editor is a natural, isolated follow-up on top of the same
`content: Json` column; nothing about this phase's data shape blocks it.

## Homepage content

Hero Slides, Testimonials, and Brands are combined on a single page
(`/admin/homepage`) as three independent modal-based CRUD managers, rather
than separate list/detail routes — each entity is small enough (a handful
of fields) that a full page per item would be more clicks for no benefit.

- **Hero Slides** — has `PublishStatus` (draft/published/archived) and
  `deletedAt`-free hard-ish lifecycle (delete removes immediately; there's
  no soft-delete/restore for slides in the schema, only publish/unpublish/
  archive via status). Desktop/mobile images via `MediaPickerField`.
  `ctas: Json?` (`HeroCta[] = {label: LocalizedText, href: string}[]`) — the
  form captures two CTA slots with English-only labels, a deliberate
  shortcut for a field the schema doesn't require localizing per-slide
  today; extending to full localized CTA labels is additive.
- **Testimonials** — the schema has **no localized fields, no `isActive`,
  no `deletedAt`.** The form and delete button match that exactly: plain
  strings, hard delete, and `isFeatured` is the closest schema-native
  analog to an "active/highlighted" flag (not invented — it already existed
  on the model).
- **Brands** — `name` is a unique plain string, `logoId` an FK via
  `MediaPickerField`, no `isActive`/`deletedAt` either — hard delete.

None of these three fields were invented to match some assumed CMS shape;
each form exposes exactly what the schema already has.

## Media integration

The Phase 6 Media Library is the **only** image source anywhere in the
Phase 7 CMS. `MediaPickerField` (a hidden input carrying the selected
`MediaItem.id`, a thumbnail preview, and a "Choose from Library" modal
backed by `searchMediaForPicker()`/`getInitialMediaPickerItems()`) is the
single component every image-bearing form uses — Service image, Location
hero desktop/mobile, BlogPost featured image, HeroSlide desktop/mobile,
Brand logo, and the SEO OG image. No CMS form has its own upload button;
uploading still only happens in `/admin/media`.

**Schema change: Service/Location image relations.** `DATABASE_ARCHITECTURE.md`
§7 already documented "service images" and "location hero images" as
intended `MediaItem` consumers, but the schema (as of Phase 6) only had
plain string columns (`Service.imageUrl`, `Location.heroDesktopImageUrl`,
`Location.heroMobileImageUrl`) — a gap Phase 6's own `MEDIA_LIBRARY.md`
flagged and deferred. This phase closes it the way the brief's Part 6
directs ("inspect the architecture first and implement the correct
integration"): added `Service.imageId`, `Location.heroDesktopImageId`,
`Location.heroMobileImageId` as new nullable FK columns to `MediaItem`
(migration `20260807220536_add_service_location_media_relations` — purely
additive, two `ADD COLUMN` + three `ADD FOREIGN KEY`, all nullable, run
against empty tables so there was zero data risk). The legacy `imageUrl`/
`heroDesktopImageUrl`/`heroMobileImageUrl` string columns were **kept**,
unused by the new admin forms, for backward compatibility — no destructive
schema change was made.

## SEO fields

`SeoMeta` (`lib/cms/seo.ts`) mirrors `DATABASE_ARCHITECTURE.md` §9's
embedded SEO shape exactly: `{title: LocalizedText, description:
LocalizedText, keywords?, ogImageId, canonical, noIndex, noFollow,
structuredData?}`, stored as a `Json seo` column on Service/Location/
BlogPost. `SeoFieldsSection` exposes it wherever that column exists — no
new database fields were invented for SEO; nothing outside the
already-approved shape was added.

## Localization

Every localized field uses the existing `Localized<T>`/`LocalizedText`
pattern (`Record<Locale, string>` for the six configured locales: en, ar,
ru, zh, fr, de) — no new translation system. `LocalizedField` renders one
labeled input/textarea per locale in a grid so an editor can see and fill
all six at once, and sets `dir="rtl"` specifically on the Arabic input so
right-to-left text composes correctly without touching the surrounding
(LTR) admin layout. `Location.name` and `Testimonial`/`Brand` fields are
**not** localized in the admin forms because they are plain `String`
columns in the schema, not `Json` — matched exactly, not "improved" beyond
what the architecture specifies.

## Admin UX

Every list page has search/filter, pagination, an empty state, and a
loading state; every form surfaces validation errors and a success toast
(`useActionState` + `useEffect` calling `showToast`/`router.refresh()` —
never a raw `useState` setter inside the effect, keeping ESLint's
`react-hooks/set-state-in-effect` rule clean); every destructive action
(delete) goes through `ConfirmDialog`. All of it runs inside the existing
`AdminShell`, so desktop and mobile behavior is inherited, not rebuilt.

## Permissions

New in this phase: the `faq` resource. Phase 4's original 15-resource/53-
permission catalog had no FAQ resource, despite `content_manager`'s
description already naming "FAQs" as in scope — this phase adds it
properly (57 permissions total) rather than routing FAQ management under
an unrelated existing resource:

| Resource | Permissions | Notes |
|---|---|---|
| `services` | `create`/`read`/`update`/`delete`/`publish` | Pre-existing |
| `locations` | `create`/`read`/`update`/`delete`/`publish` | Pre-existing |
| `blog` | `create`/`read`/`update`/`delete`/`publish` | Pre-existing |
| `homepage` | `create`/`read`/`update`/`delete`/`publish` | Pre-existing |
| `faq` | `create`/`read`/`update`/`delete` | **New this phase** — no `publish` action since the schema has no publish workflow for FAQ |

Role grants: `super_admin`/`admin`/`content_manager` get full `faq:*`;
`seo_manager`/`viewer` get `faq:read` only — mirroring how those roles are
already scoped for `services`/`locations`/`blog`. Seeded via the existing
idempotent `npm run db:seed` (upsert-by-name), not a new seeding mechanism.

Every `lib/cms/*` function calls `requireCmsPermission()` itself,
independent of whatever page or action called it — the UI hiding an action
a role can't perform is convenience only, never the actual boundary (same
five-level model `RBAC.md` establishes). Self-action/escalation protections
from Phase 4 are untouched; nothing in this phase adds new privilege paths.

## Audit logging

Every create/update/publish/unpublish/archive/delete/restore across all
five modules writes an `AuditLog` row via the existing `writeAuditLog()` —
no new logging mechanism. Denied attempts (permission check fails) are
separately logged as `unauthorized_access` by `requireCmsPermission()`,
same as every other guarded module.

## Draft/publish safety

Service, Location, and BlogPost all carry `PublishStatus` (`draft` /
`published` / `archived`) plus `deletedAt`. `lib/public/cms-content.ts`'s
three query functions filter to `status: "published", deletedAt: null` —
the only state a public page is ever meant to read. This is covered by a
dedicated test (`lib/public/__tests__/cms-content.integration.test.ts`)
that seeds one row of each status (plus a soft-deleted published row) per
model and asserts only the published, non-deleted one is ever returned.
FAQ/Testimonial/Brand have no draft concept in the schema — anything
created there is immediately "live" from a data standpoint, matching how
those models were designed.

## Public Site Integration — now live (Phase 8)

Phase 7 deliberately did not connect the public site to this CMS — every
table was empty, and every public page still read from static `data/*.ts`
files. **Phase 8 completed that cutover**: it migrated the real static
content into these tables and wired the public pages to read from them,
with the static files kept as a permanent, tested fallback rather than
deleted. See `PUBLIC_CMS_INTEGRATION.md` for the full architecture —
content migration, the fallback-aware public read layer
(`lib/public/cms-content.ts`), localization, SEO/sitemap verification,
caching/revalidation strategy, browser testing, and rollback safety.

## Testing

`lib/cms/__tests__/{services,locations,faq,blog,homepage}.integration.test.ts`
plus `lib/public/__tests__/cms-content.integration.test.ts` — all real
Postgres integration tests (same `vi.mock` session + `createTestUsers()`
pattern as the rest of the suite), covering per module: permission gating
(unauthenticated denied, an under-permissioned role denied with an
`unauthorized_access` audit-log assertion), slug/key format and uniqueness
validation, required-field validation, successful create with an audit-log
assertion, localized/array-field round-tripping, update (including same-row
slug reuse), publish/unpublish (`publishedAt` stamped on publish, preserved
not cleared on unpublish) with a publish-permission-denied case, soft-
delete/restore and exclusion from default list results (where the schema
has soft-delete), hard-delete behavior (where it doesn't), and the FAQ
single-parent constraint at both the application-validation layer and the
raw database CHECK-constraint layer. 65 new tests, all passing; full suite
(pre-existing + new) is 241 tests across 18 files, all green.

## Deferred / known limitations

- **Rich block editor for blog content** — see "Blog post content" above.
- **Vehicle-scoped FAQs have no vehicles to pick from** — `listFaqParentOptions()`
  already queries `Vehicle`, it's just always empty until Fleet CMS exists.
- **HeroSlide CTAs are English-only, two-slot** — see "Homepage content" above.
- **`Service`/`Location` legacy `imageUrl`-style string columns** — kept for
  backward compatibility; now actively used by the Phase 8 content
  migration and public read layer's fallback (see
  `PUBLIC_CMS_INTEGRATION.md`), not just unused compatibility scaffolding.
- **No automatic image derivative generation** — unchanged from Phase 6;
  `MediaPickerField` selects whatever was actually uploaded.

## Future extension points

- A richer content-block editor slots onto `BlogPost.content` without a
  schema change.
- Fleet CMS, once built, only needs to populate `listFaqParentOptions()`'s
  vehicle list — the FAQ scope picker and single-parent validation already
  handle it.
- The public-site cutover (above) is scoped and ready to execute as its own
  phase once content migration is planned.
- Any new CMS module (Pricing, Fleet, …) can reuse every component in
  `components/admin/cms/` as-is — none of them are Service/Location/Blog-
  specific.
