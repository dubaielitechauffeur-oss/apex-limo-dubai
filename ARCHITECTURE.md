# Apex Limo & Chauffeur Dubai — Enterprise Architecture

## 1. Current Project Architecture

### Stack
- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3 with custom brand tokens
- **i18n:** next-intl v4 — 6 locales (en, ar, ru, zh, fr, de), RTL support
- **Validation:** Zod 4
- **Email:** Resend SDK
- **Icons:** Lucide React

### Current Folder Structure
```
app/
  [locale]/            # Locale-prefixed routes (en unprefixed, others /ar /ru etc.)
    layout.tsx          # Root layout (fonts, Header, Footer, GA, JSON-LD)
    page.tsx            # Homepage
    about/
    booking/            # Conversion page (stripped chrome)
    quote/              # Conversion page (stripped chrome)
    contact/
    faqs/
    fleet/
      [vehicle]/        # Vehicle detail OR category listing
    services/
      [service]/
    locations/
      [location]/
    blog/
      [slug]/
    privacy-policy/
    terms/
  api/
    booking/route.ts    # POST — lead submission
    contact/route.ts
    quote/route.ts
components/             # UI components grouped by page/feature
  about/ blog/ booking/ contact/ faqs/ fleet/
  home/ layout/ locations/ services/ shared/
data/                   # Static content (fleet, services, locations, blog, FAQs)
fonts/                  # Per-locale font loading (latin, arabic, chinese)
i18n/                   # Routing, navigation, request config, locale metadata
lib/                    # Shared utilities (validation, SEO, email, constants)
messages/               # 12 JSON namespaces × 6 locales
public/images/          # All imagery (fleet, services, locations, blog, etc.)
```

### Key Architectural Patterns
- **File-based content:** All data lives in `data/*.ts` as typed arrays
- **Localized<T> pattern:** Multi-locale text fields use `Record<Locale, T>`
- **Section tone system:** `obsidian | linen | pearl | ivory | charcoal` rhythm
- **Cross-link map:** `lib/cross-links.ts` wires vehicle ↔ service ↔ location
- **Conversion path detection:** `lib/layout.ts` strips chrome on booking/quote
- **Lead pipeline:** Rate limit → body parse → honeypot → Zod → validate → dispatch
- **SEO:** `buildMetadata()` generates canonical, hreflang, OG, Twitter; JSON-LD for Organization, FAQ, Article, Breadcrumb, AggregateRating
- **Bot bypass:** Middleware skips locale negotiation for crawler user-agents

---

## 2. Enterprise Architecture (Phase 1 — This Phase)

### New Directory Structure
```
types/                          # Shared enterprise entity types
  common.ts                     # Base traits: Timestamps, Publishable, Pagination
  index.ts                      # Barrel re-export
  entities/
    vehicle.ts                  # VehicleEntity, VehicleCategoryEntity, rates, FAQs
    booking.ts                  # BookingEntity, status/source/payment enums
    quote.ts                    # QuoteEntity, status lifecycle
    blog.ts                     # BlogPostEntity, ContentBlock, categories
    service.ts                  # ServiceEntity, ServiceFaqEntity
    location.ts                 # LocationEntity, GeoCoordinates, routes
    media.ts                    # MediaEntity, MediaFolderEntity, variants
    user.ts                     # UserEntity, RoleEntity, RBAC Permission
    settings.ts                 # CompanySettingsEntity, SocialLinks, Footer
    pricing.ts                  # PricingTierEntity, PricingPackageEntity
    seo.ts                      # SeoFields (shared across content entities)
    analytics.ts                # AnalyticsEvent, DashboardMetric, DashboardSummary
    audit.ts                    # AuditLogEntry, AuditChange
    homepage.ts                 # HeroSlideEntity, HeroCTAButton

config/
  modules.ts                   # Module registry with boundaries & dependencies
  admin.ts                     # Admin sidebar navigation structure

features/                      # Feature modules (empty — implementation in Phase 2+)
  admin/                       # Admin shell, layout, dashboard
  fleet/                       # Vehicle CRUD, categories, gallery
  bookings/                    # Booking lifecycle management
  quotes/                      # Quote lifecycle, conversion
  blog/                        # Blog post CRUD, content blocks
  services/                    # Service page management
  locations/                   # Location page management
  media/                       # Media library, upload, folders
  settings/                    # Company settings management
  analytics/                   # Analytics dashboard
  seo/                         # SEO metadata manager
  translations/                # Translation namespace editor
  pricing/                     # Pricing tier/package management
  users/                       # User accounts, roles, permissions
  audit/                       # Audit log viewer
  homepage/                    # Homepage hero/CTA management

app/admin/                     # Admin panel App Router routes (Phase 2)

lib/auth/                      # Auth.js integration (Phase 3)
lib/db/                        # Prisma client & helpers (Phase 2)
lib/permissions/               # RBAC enforcement (Phase 3)

emails/                        # Transactional email templates (Phase 2)
```

### Module Boundaries

Each feature module is self-contained. When implemented, each will contain:

```
features/<module>/
  components/       # Module-specific UI components
  hooks/            # Module-specific React hooks
  actions/          # Server actions (create, update, delete)
  queries/          # Data fetching (server-side)
  utils/            # Module-specific utilities
  constants.ts      # Module-specific constants
```

Modules communicate through:
- **Entity types** from `types/` (never import another module's internals)
- **Shared services** in `lib/` (db, auth, permissions, validation)
- **Entity IDs** as foreign keys (never pass full objects across boundaries)

### Module Dependency Graph
```
media ──────────────────────────────────────────────┐
  ├── fleet ──── bookings ──── analytics            │
  │     └── pricing   └── quotes ──┘                │
  ├── blog                                          │
  ├── services                                      │
  ├── locations                                     │
  ├── homepage                                      │
  └── seo                                           │
                                                    │
settings (independent)                              │
translations (independent)                          │
users ──── audit                                    │
admin ──── users                                    │
```

---

## 3. Phased Rollout Plan

### Phase 2: Database & Core CRUD
- Install Prisma, configure PostgreSQL
- Create schema from entity types in `types/entities/`
- Implement `lib/db/` client & helpers
- Build media library (prerequisite for all content modules)
- Build fleet, bookings, quotes, pricing, blog, services, locations
- Build settings, homepage CMS
- Build admin shell with sidebar navigation
- Migrate `data/*.ts` static content into database via seed scripts
- Keep public site reading from `data/*.ts` until all data is migrated

### Phase 3: Auth & Access Control
- Install Auth.js (NextAuth v5)
- Implement `lib/auth/` with Google/email providers
- Implement `lib/permissions/` RBAC
- Build users & roles management
- Build audit log system
- Protect all `/admin` routes

### Phase 4: Advanced Features
- SEO Manager (per-page meta overrides)
- Translation Manager (in-admin editing)
- Analytics Dashboard (booking/quote/revenue metrics)
- WhatsApp/CRM notification channels (replace stubs)
- Email template management

### Phase 5: Future Extensions
- Customer Dashboard (booking history, profile)
- Driver Dashboard (assignments, schedule)
- Mobile App API
- CRM Integrations (HubSpot, Salesforce)

---

## 4. Data Migration Strategy

The current site uses file-based data (`data/*.ts`). Migration to PostgreSQL:

1. **Dual-read pattern:** New admin writes to DB; public site reads from DB with
   file-based fallback during transition
2. **Seed scripts:** Convert `data/fleet.ts`, `data/services.ts`,
   `data/locations.ts`, `data/blog.ts` into Prisma seed data
3. **Image migration:** Move from `public/images/` to cloud storage (S3/R2),
   managed through the Media Library module
4. **Translation migration:** `messages/*.json` stays for the public site's
   compile-time i18n; admin-managed content uses `Localized<T>` fields in the DB

---

## 5. Architectural Risks

### Risk 1: Data Layer Transition
**Risk:** Switching from file-based to database-backed content could break the
public site if not handled carefully.
**Mitigation:** Use the dual-read pattern. Keep `data/*.ts` as the fallback
source until DB is seeded and verified. Feature-flag the data source.

### Risk 2: i18n Complexity
**Risk:** The site uses two i18n systems — `next-intl` message files for UI
strings and `Localized<T>` in data files for content. The admin panel adds a
third: DB-stored `Localized<T>` fields.
**Mitigation:** Keep `next-intl` for UI strings (both public and admin). Use
`Localized<T>` consistently for all content, whether file-based or DB-stored.
The Translation Manager only manages `messages/*.json` overrides.

### Risk 3: Image Management
**Risk:** Currently ~100+ images in `public/images/` served statically. Moving
to a media library with upload/delete requires cloud storage.
**Mitigation:** Phase 2 media library should support both local (`public/`)
and cloud storage backends. Start with local uploads during development,
switch to cloud (S3/R2) for production.

### Risk 4: Admin Route Security
**Risk:** `app/admin/` routes will exist before auth is implemented (Phase 3).
**Mitigation:** Phase 2 admin routes should be behind a simple middleware
check (environment variable or basic auth) until Auth.js is integrated.

### Risk 5: Bundle Size
**Risk:** Admin panel dependencies (rich text editors, file uploaders, data
tables, charts) could bloat the public site bundle.
**Mitigation:** Admin routes live under `app/admin/` (no `[locale]` prefix),
completely separated from the public `app/[locale]/` tree. Next.js
code-splits by route — admin code never loads on public pages.

---

## 6. Recommendations Before Database Design

1. **Choose a cloud provider for media storage** before designing the Media
   entity schema (S3, Cloudflare R2, or Vercel Blob).

2. **Decide on soft-delete vs. hard-delete** per entity. Current types include
   `SoftDeletable` — confirm this is the desired behavior for all entities.

3. **Define the pricing model** in detail. Current vehicle rates are a flat
   structure (`VehicleRates`). Confirm whether dynamic/seasonal pricing,
   surge pricing, or package bundles are needed before finalizing the schema.

4. **Map the booking status lifecycle** end-to-end: which transitions are
   allowed, who can trigger them, and what side effects each has (emails,
   notifications, audit entries).

5. **Decide on the Auth.js provider set** (Google, email/magic link, credentials)
   before designing the User entity — Auth.js session/account tables will
   influence the schema.

6. **Audit the existing `Localized<T>` pattern** — with 6 locales, every
   localized text field becomes 6 DB columns or a JSON column. Decide on
   the storage strategy (JSON column vs. translation table) before creating
   Prisma models.

7. **Plan the admin URL structure** — the current architecture reserves
   `app/admin/` outside the `[locale]` segment. Confirm whether the admin
   panel needs i18n (admin in Arabic) or if English-only is acceptable.

8. **Evaluate rich text editing** needs for blog content blocks and long
   descriptions. The current `ContentBlock` system is structured; decide
   whether to keep it or move to a WYSIWYG editor (Tiptap, Plate, etc.).
