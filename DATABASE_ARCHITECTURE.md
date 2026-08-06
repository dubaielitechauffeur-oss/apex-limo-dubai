# Apex Limo & Chauffeur Dubai — Database Architecture (Phase 2A)

> Planning document only. No schema, migration, or production code to be
> generated until this document is reviewed and approved.

---

## 1. Complete Entity List

### Auth & Access Control (Phase 3 — Auth.js)

| # | Entity | Purpose |
|---|--------|---------|
| 1 | **User** | Admin/staff accounts (name, email, role, status) |
| 2 | **Account** | Auth.js — OAuth provider links (Google, GitHub, etc.) |
| 3 | **Session** | Auth.js — active browser sessions |
| 4 | **VerificationToken** | Auth.js — magic-link / email verification |
| 5 | **Role** | Named permission sets (super_admin, admin, editor, viewer, driver) |

### Fleet

| # | Entity | Purpose |
|---|--------|---------|
| 6 | **VehicleCategory** | Fleet categories: Sedan, SUV, Van, Ultra-Luxury |
| 7 | **Vehicle** | Fleet vehicles with all detail-page content |
| 8 | **VehicleImage** | Ordered gallery images per vehicle |

### Operations

| # | Entity | Purpose |
|---|--------|---------|
| 9 | **Booking** | Full booking lifecycle (pending → confirmed → completed) |
| 10 | **Quote** | Quote lifecycle (pending → sent → accepted → converted) |
| 11 | **ContactSubmission** | Contact form leads |

### Content — Services

| # | Entity | Purpose |
|---|--------|---------|
| 12 | **Service** | Service pages (airport-transfers, corporate-chauffeur, etc.) |

### Content — Locations

| # | Entity | Purpose |
|---|--------|---------|
| 13 | **Location** | Location pages (dubai-marina, downtown-dubai, etc.) |
| 14 | **LocationPopularRoute** | Popular routes from a location with durations |

### Content — Blog

| # | Entity | Purpose |
|---|--------|---------|
| 15 | **BlogPost** | Blog articles with structured content blocks |
| 16 | **BlogCategory** | Blog post categories |
| 17 | **Tag** | Reusable tags (shared across blog posts, services, locations) |
| 18 | **BlogPostTag** | Many-to-many join: BlogPost ↔ Tag |

### Content — FAQs (Unified)

| # | Entity | Purpose |
|---|--------|---------|
| 19 | **Faq** | All FAQs — homepage, vehicle, service, location, hub-only |
| 20 | **FaqCategory** | FAQ groupings for the hub page filter chips |

### Content — Homepage

| # | Entity | Purpose |
|---|--------|---------|
| 21 | **HeroSlide** | Homepage hero slides (images, text, CTAs) |

### Content — Social Proof

| # | Entity | Purpose |
|---|--------|---------|
| 22 | **Testimonial** | Customer reviews (direct + future Google sync) |
| 23 | **Brand** | Car manufacturer logos for the homepage carousel |

### Media

| # | Entity | Purpose |
|---|--------|---------|
| 24 | **MediaItem** | Every uploaded file (images, documents, videos) |
| 25 | **MediaFolder** | Folder tree for media organization |

### Cross-References

| # | Entity | Purpose |
|---|--------|---------|
| 26 | **VehicleServiceLink** | M:M join — recommended vehicle ↔ service pairings |
| 27 | **VehicleLocationLink** | M:M join — recommended vehicle ↔ location pairings |

### Settings

| # | Entity | Purpose |
|---|--------|---------|
| 28 | **GlobalSettings** | Single-row: company info, social links, footer, defaults |

### Audit & Analytics

| # | Entity | Purpose |
|---|--------|---------|
| 29 | **AuditLog** | Immutable change history (who changed what, when) |

### Future (Reserved — not implemented until needed)

| # | Entity | Purpose |
|---|--------|---------|
| 30 | **Customer** | End-user accounts for future customer dashboard |
| 31 | **Driver** | Chauffeur profiles for future driver dashboard |
| 32 | **Payment** | Stripe payment records for future billing |
| 33 | **Notification** | Email/WhatsApp/push notification log |

**Total: 29 active entities + 4 reserved = 33**

---

## 2. ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUTH & ACCESS CONTROL                              │
│                                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────────────────┐          │
│  │   User   │◄──►│ Account  │    │ Session  │    │VerificationToken │          │
│  │          │    │(Auth.js) │    │(Auth.js) │    │   (Auth.js)      │          │
│  │ roleId──►├───►│          │    │ userId──►├───►│                  │          │
│  └────┬─────┘    └──────────┘    └──────────┘    └──────────────────┘          │
│       │                                                                         │
│       ▼                                                                         │
│  ┌──────────┐                                                                   │
│  │   Role   │  (super_admin, admin, editor, viewer, driver)                     │
│  │          │  permissions: String[]                                             │
│  └──────────┘                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    FLEET                                        │
│                                                                                 │
│  ┌─────────────────┐         ┌──────────────────┐                               │
│  │ VehicleCategory │◄────┐   │   VehicleImage   │                               │
│  │                 │     │   │   vehicleId ──►   │──► MediaItem                  │
│  │ slug (unique)   │     │   │   mediaId ──►     │                               │
│  │ name (JSONB)    │     │   │   sortOrder       │                               │
│  └─────────────────┘     │   └──────────────────┘                               │
│                          │            ▲                                          │
│                          │            │ 1:N                                      │
│                          │   ┌────────┴─────────┐                               │
│                          └──►│     Vehicle       │                               │
│                              │                   │──► Faq (entityType=vehicle)   │
│                              │ slug (unique)     │                               │
│                              │ rates (JSONB)     │◄──► VehicleServiceLink        │
│                              │ seo (JSONB)       │◄──► VehicleLocationLink       │
│                              │ status            │                               │
│                              │ features (JSONB)  │                               │
│                              │ whyChoose (JSONB) │                               │
│                              └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 OPERATIONS                                      │
│                                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────────┐                     │
│  │   Booking   │   │    Quote    │   │ContactSubmission  │                     │
│  │             │   │             │   │                   │                     │
│  │ reference   │   │ reference   │   │ reference         │                     │
│  │ status      │   │ status      │   │ fullName          │                     │
│  │ vehicleId──►│   │ vehicleId  │   │ email             │                     │
│  │ driverId──► │   │ convertedTo│──►│ subject           │                     │
│  │ customerId─►│   │ Booking    │   │ message           │                     │
│  └─────────────┘   └─────────────┘   └───────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CONTENT                                       │
│                                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐           │
│  │   Service    │    │    Location      │    │     BlogPost        │           │
│  │              │    │                  │    │                     │           │
│  │ slug         │    │ slug             │    │ slug                │           │
│  │ name (JSONB) │    │ name             │    │ title (JSONB)       │           │
│  │ long desc    │    │ isAirport        │    │ content (JSONB)     │           │
│  │ seo (JSONB)  │    │ geo (JSONB)      │    │ author (JSONB)      │           │
│  │ status       │    │ seo (JSONB)      │    │ seo (JSONB)         │           │
│  │              │    │ status           │    │ categoryId──►       │           │
│  │ ──► Faq      │    │                  │    │ featuredImageId──►  │           │
│  │              │    │ ──► Faq          │    │ status              │           │
│  └──────────────┘    │ ──► PopularRoute │    │                     │           │
│                      └──────────────────┘    │ ◄──► BlogPostTag    │           │
│                                              └──────────────────────┘           │
│                                                       │                         │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────┴───────────┐             │
│  │  HeroSlide   │    │ Testimonial  │    │   BlogCategory  │ Tag │             │
│  │              │    │              │    └────────────────────────┘             │
│  │ title (JSONB)│    │ name         │                                           │
│  │ desktopImg──►│    │ rating       │    ┌──────────────┐                       │
│  │ mobileImg──► │    │ text         │    │    Brand     │                       │
│  │ ctas (JSONB) │    │ featured     │    │ name, logo──►│──► MediaItem          │
│  │ status       │    │              │    └──────────────┘                       │
│  └──────────────┘    └──────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              UNIFIED FAQS                                       │
│                                                                                 │
│  ┌─────────────────┐         ┌──────────────────────────────────────────┐       │
│  │   FaqCategory   │◄────────│                  Faq                    │       │
│  │                 │         │                                          │       │
│  │ key (unique)    │         │ categoryId ──► FaqCategory               │       │
│  │ name (JSONB)    │         │ vehicleId ──►? Vehicle     (nullable)   │       │
│  │ showChip        │         │ serviceId ──►? Service     (nullable)   │       │
│  │ sortOrder       │         │ locationId ──►? Location   (nullable)   │       │
│  └─────────────────┘         │ question (JSONB)                        │       │
│                              │ answer (JSONB)                          │       │
│                              │ sortOrder                               │       │
│                              │                                          │       │
│                              │ (all nullable FKs null = homepage/hub)  │       │
│                              │ (at most ONE FK is set per row)         │       │
│                              └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   MEDIA                                         │
│                                                                                 │
│  ┌─────────────────┐         ┌──────────────────────────────────┐               │
│  │  MediaFolder    │◄───┐    │          MediaItem               │               │
│  │                 │    │    │                                   │               │
│  │ name            │    │    │ filename                          │               │
│  │ parentId ──►?   │────┘    │ mimeType                         │               │
│  │ sortOrder       │         │ sizeBytes                         │               │
│  │                 │         │ width, height                     │               │
│  └─────────────────┘         │ alt (JSONB)                       │               │
│                              │ folderId ──►? MediaFolder         │               │
│                              │ type (image | video | document)  │               │
│                              │ variant (desktop | mobile | ...)  │               │
│                              │ storageProvider (local | s3 | r2) │               │
│                              │ storagePath                       │               │
│                              │ url                               │               │
│                              │ uploadedById ──► User             │               │
│                              └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SETTINGS & AUDIT                                     │
│                                                                                 │
│  ┌──────────────────────────────────┐    ┌──────────────────────────────────┐   │
│  │         GlobalSettings          │    │           AuditLog              │   │
│  │         (single row)            │    │                                  │   │
│  │                                  │    │ action (create/update/delete/..)│   │
│  │ companyName                      │    │ entityType                      │   │
│  │ phone, whatsapp, email           │    │ entityId                        │   │
│  │ address (JSONB — localized)      │    │ userId ──► User                 │   │
│  │ socialLinks (JSONB)              │    │ changes (JSONB)                 │   │
│  │ footer (JSONB)                   │    │ ipAddress                       │   │
│  │ businessHours (JSONB)            │    │ createdAt (immutable)           │   │
│  │ defaultSeo (JSONB)               │    │                                  │   │
│  │ logoId ──► MediaItem             │    │ (NEVER deleted)                 │   │
│  │ faviconId ──► MediaItem          │    └──────────────────────────────────┘   │
│  │ defaultCurrency                  │                                           │
│  │ timezone                         │                                           │
│  └──────────────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Relationship Documentation

### One-to-One Relationships

| Parent | Child | Reason |
|--------|-------|--------|
| User ↔ Account | Auth.js | Auth.js links one OAuth provider account to one user. Multiple Account rows per user if multiple providers are used. |

### One-to-Many Relationships

| Parent (1) | Child (N) | FK Column | Reason |
|------------|-----------|-----------|--------|
| VehicleCategory → Vehicle | `categoryId` on Vehicle | A category groups many vehicles; each vehicle belongs to exactly one body-style category. |
| Vehicle → VehicleImage | `vehicleId` on VehicleImage | A vehicle has an ordered gallery; each image belongs to one vehicle. |
| Vehicle → Faq | `vehicleId` on Faq | A vehicle can have many FAQs; each vehicle FAQ belongs to one vehicle. |
| Service → Faq | `serviceId` on Faq | Same pattern — per-service FAQs. |
| Location → Faq | `locationId` on Faq | Same pattern — per-location FAQs. |
| Location → LocationPopularRoute | `locationId` on LocationPopularRoute | A location lists several popular routes with estimated durations. |
| FaqCategory → Faq | `categoryId` on Faq | FAQs are grouped by category for the hub page filter. |
| BlogCategory → BlogPost | `categoryId` on BlogPost | A blog category contains many posts; each post has at most one category. |
| MediaFolder → MediaItem | `folderId` on MediaItem | A folder contains many media items; an item optionally belongs to one folder. |
| MediaFolder → MediaFolder | `parentId` on MediaFolder (self-referencing) | Nested folder hierarchy — each folder has at most one parent. |
| User → MediaItem | `uploadedById` on MediaItem | Track who uploaded each file. |
| User → AuditLog | `userId` on AuditLog | Track who performed each audited action. |
| User → Session | `userId` on Session | Auth.js: a user can have multiple active sessions. |
| Role → User | `roleId` on User | A role is assigned to many users; each user has one role. |

### Many-to-Many Relationships

| Entity A | Entity B | Join Table | Reason |
|----------|----------|------------|--------|
| Vehicle | Service | **VehicleServiceLink** | A vehicle can be recommended for multiple services (e.g. Escalade for airport + VIP), and a service recommends multiple vehicles. Replaces the current hard-coded `VEHICLE_CROSS_LINKS` map. |
| Vehicle | Location | **VehicleLocationLink** | A vehicle can be recommended for multiple locations, and a location recommends multiple vehicles. Same cross-link map. |
| BlogPost | Tag | **BlogPostTag** | A blog post can have many tags, and tags are reusable across posts. |

### Polymorphic-Style (Nullable FK) Relationships

| Entity | Nullable FKs | Reason |
|--------|-------------|--------|
| **Faq** | `vehicleId?`, `serviceId?`, `locationId?` | A FAQ belongs to either a vehicle, a service, a location, or none (homepage/hub standalone). At most one FK is non-null per row. This avoids four separate FAQ tables while preserving referential integrity through real foreign keys. A CHECK constraint enforces the at-most-one rule. |

### Why These Relationship Types Were Chosen

- **Vehicle → VehicleImage (1:N, not embedded JSON):** Images are individually ordered, uploaded, deleted, and linked to the media library. A separate table enables CRUD without rewriting the parent.

- **Vehicle.rates (embedded JSONB, not separate table):** The 6 rate fields (tenHours, fiveHours, oneHour, airport, extraHour, additionalCity) are always loaded/saved together, never queried independently, and have no individual identity. Embedding avoids a JOIN for every vehicle fetch. If dynamic/seasonal pricing is needed later, a separate PricingTier table can be added alongside.

- **Vehicle.features / whyChoose (embedded JSONB arrays):** These are ordered localized string lists with no individual identity or cross-references. Embedding as `Localized<string[]>` (JSONB) matches the current data pattern and avoids dozens of thin child tables.

- **BlogPost.content (embedded JSONB array):** Content blocks (heading, paragraph, list, faq) are always loaded/saved with the post, never queried independently, and the discriminated-union structure maps naturally to a JSON array. This matches the existing `BlogContentBlock[]` type and how headless CMS systems structure rich text.

- **Faq (unified table with nullable FKs):** The FAQ hub page merges FAQs from all sources. A single table makes this a simple query (`SELECT * FROM faq ORDER BY categoryId, sortOrder`) instead of a UNION across four tables. The nullable FKs preserve referential integrity while avoiding a polymorphic `entityType + entityId` pattern that can't be enforced at the database level.

- **GlobalSettings (single-row table):** Company info, social links, footer, and default SEO are always loaded together as one blob. A key-value store would require multiple queries and lose type safety. A single-row table with JSONB sub-fields is the simplest and fastest approach.

---

## 4. Normalization Report

### Normalization Decisions by Entity

| Entity | Normal Form | Decision | Rationale |
|--------|-------------|----------|-----------|
| Vehicle | 3NF with JSONB | Category normalized to separate table. Rates, features, whyChoose, idealFor, badge stored as JSONB. | Category is a shared dimension queried independently (listing pages). Rates/features are always loaded with the vehicle, have no identity of their own, and don't participate in cross-entity queries. |
| VehicleImage | 3NF | Separate table with FK to Vehicle and FK to MediaItem. | Images have individual ordering, are uploaded/deleted independently, and link to the centralized media library. |
| Faq | 3NF with nullable FKs | One table for all FAQ sources. Category normalized to FaqCategory. | Eliminates duplication of the FAQ schema across 4 entity-specific tables. The hub page needs all FAQs in one query. |
| Service | 3NF with JSONB | Benefits, whyChoose, tags stored as JSONB. Long description stored as JSONB (localized string array with embedded Markdown-lite links). | These list fields are always loaded with the service, have no cross-entity references, and their localized-array structure maps directly to JSONB. |
| Location | 3NF with JSONB | Landmarks, whyChoose, tags stored as JSONB. Popular routes normalized to a separate table. | Landmarks/tags are simple lists. Popular routes have multiple fields (from, to, duration) and ordering, justifying a child table. |
| BlogPost | 3NF with JSONB | Content blocks, author, SEO stored as JSONB. Category normalized. Tags via M:M join. | Content blocks are always loaded with the post and are never queried independently. Category is a shared dimension. Tags are reusable and searchable, justifying a separate table. |
| Testimonial | 2NF (intentional) | ServiceUsed and Location stored as strings, not FK references. | Testimonials reference services/locations by display name for flexibility — the review text shouldn't break if a service slug changes. Reviews may also reference services not yet in the system. |
| GlobalSettings | Denormalized (intentional) | One row with nested JSONB for social links, footer, business hours, default SEO. | This data is always loaded atomically on every page request (cached). Normalizing it into 5+ tables adds JOINs with zero querying benefit. |
| AuditLog | 2NF (intentional) | `entityType` is a string, `entityId` is a string, not FK. Changes stored as JSONB. | Audit logs must survive the deletion of the entity they reference. Foreign keys would either prevent deletion or cascade-delete the audit trail. String references with JSONB diffs are the standard approach. |

### Eliminated Duplication

| Before (current code) | After (database) | What changed |
|----------------------|-------------------|--------------|
| 4 separate FAQ structures (VehicleFAQ, ServiceFAQ, LocationFAQ, FAQ) with identical shapes | One `Faq` table with nullable parent FKs | Schema defined once; queries unified |
| `VEHICLE_CROSS_LINKS` hard-coded Record mapping vehicles to one service and one location each | Two M:M join tables (`VehicleServiceLink`, `VehicleLocationLink`) | Admin can manage cross-links; vehicles can link to multiple services/locations |
| `SITE` constants (phone, email, whatsapp) duplicated in code and email templates | `GlobalSettings` single-row table | One source of truth, editable from admin |
| `FLEET_SIZE` constant independent of actual fleet data | Computed from `SELECT COUNT(*) FROM vehicle WHERE status = 'published'` | Always accurate, no manual sync |
| Brand list hard-coded with local file paths | `Brand` table with FK to MediaItem | Logos managed through media library |
| Separate `SERVICES_FAQS` and per-service `faqs` with no shared structure | Unified `Faq` table with `serviceId` FK or null | Services listing page FAQs are just FAQs with no service FK but with a "services" category |

### Reusable Entities

| Entity | Reused By |
|--------|-----------|
| **MediaItem** | Vehicle images, blog featured images, hero slide images (desktop + mobile), brand logos, location hero images, service images, settings logo/favicon |
| **Faq** | Vehicles, services, locations, homepage, FAQ hub |
| **Tag** | Blog posts (now); extensible to services, locations in future |
| **FaqCategory** | All FAQs regardless of parent entity |

---

## 5. Index Strategy

### Primary Lookup Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| Vehicle | `slug` | UNIQUE | Vehicle detail page: `/fleet/[vehicle]` |
| Vehicle | `status, categoryId, sortOrder` | COMPOSITE | Fleet listing + category filtering |
| Vehicle | `status, isElectric, sortOrder` | COMPOSITE | Electric vehicle category page |
| VehicleCategory | `slug` | UNIQUE | Category page: `/fleet/sedan` |
| Service | `slug` | UNIQUE | Service detail page |
| Service | `status, sortOrder` | COMPOSITE | Services listing |
| Location | `slug` | UNIQUE | Location detail page |
| Location | `status, sortOrder` | COMPOSITE | Locations listing |
| BlogPost | `slug` | UNIQUE | Blog post page |
| BlogPost | `status, publishedAt DESC` | COMPOSITE | Blog listing (published, newest first) |
| BlogPost | `categoryId, status` | COMPOSITE | Blog posts filtered by category |
| HeroSlide | `status, sortOrder` | COMPOSITE | Homepage hero carousel |

### Operations Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| Booking | `reference` | UNIQUE | Lookup by confirmation reference |
| Booking | `status, createdAt DESC` | COMPOSITE | Admin booking list with status filter |
| Booking | `email` | BTREE | Lookup all bookings by customer email |
| Booking | `vehicleId` | BTREE | Bookings for a specific vehicle |
| Booking | `driverId` | BTREE | Bookings assigned to a specific driver |
| Booking | `date` | BTREE | Bookings by trip date (calendar view) |
| Quote | `reference` | UNIQUE | Lookup by quote reference |
| Quote | `status, createdAt DESC` | COMPOSITE | Admin quote list with status filter |
| Quote | `email` | BTREE | Lookup quotes by customer email |
| ContactSubmission | `reference` | UNIQUE | Lookup by reference |
| ContactSubmission | `createdAt DESC` | BTREE | Admin contact list |

### FAQ Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| Faq | `vehicleId, sortOrder` | COMPOSITE | FAQs for a vehicle detail page |
| Faq | `serviceId, sortOrder` | COMPOSITE | FAQs for a service detail page |
| Faq | `locationId, sortOrder` | COMPOSITE | FAQs for a location detail page |
| Faq | `categoryId, sortOrder` | COMPOSITE | FAQ hub grouped by category |

### Media Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| MediaItem | `folderId, createdAt DESC` | COMPOSITE | Browse folder contents |
| MediaItem | `type, createdAt DESC` | COMPOSITE | Filter by media type |
| MediaItem | `originalFilename` | GIN (trigram) | Search by filename |
| MediaFolder | `parentId` | BTREE | Folder tree navigation |

### Audit Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| AuditLog | `entityType, entityId` | COMPOSITE | History for a specific entity |
| AuditLog | `userId, createdAt DESC` | COMPOSITE | Activity by user |
| AuditLog | `createdAt DESC` | BTREE | Recent activity feed |

### Join Table Indexes

| Table | Columns | Type | Query Pattern |
|-------|---------|------|---------------|
| VehicleServiceLink | `vehicleId, serviceId` | UNIQUE COMPOSITE | Prevent duplicate links |
| VehicleServiceLink | `serviceId` | BTREE | Vehicles for a service page |
| VehicleLocationLink | `vehicleId, locationId` | UNIQUE COMPOSITE | Prevent duplicate links |
| VehicleLocationLink | `locationId` | BTREE | Vehicles for a location page |
| BlogPostTag | `blogPostId, tagId` | UNIQUE COMPOSITE | Prevent duplicate tags |
| BlogPostTag | `tagId` | BTREE | Posts by tag |

### Why These Indexes

- **Slug uniqueness** on all content entities ensures URL integrity and enables O(1) lookup for every detail page.
- **Composite status + sort** indexes cover the most frequent admin and public listing queries — the database can satisfy `WHERE status = 'published' ORDER BY sortOrder` from the index alone without touching the table.
- **Booking/quote email indexes** support customer-lookup workflows (find all bookings for `john@example.com`) which will be critical for CRM and customer dashboard.
- **AuditLog entity indexes** make the "view history" action on any admin entity instantaneous, even with millions of log rows.
- **Trigram index on MediaItem.originalFilename** enables `LIKE '%keyword%'` substring search at scale, which a standard B-tree index cannot.
- **Descending date indexes** on listings are critical because every admin list sorts newest-first by default.

---

## 6. Soft Delete Strategy

### Entities That MUST Use Soft Delete

| Entity | Reason |
|--------|--------|
| **Vehicle** | May be referenced by past bookings. Deleting would orphan booking records and break audit trail. Soft delete hides from public site while preserving history. |
| **Service** | Referenced by bookings (serviceType field), cross-links, and FAQs. Same reasoning as Vehicle. |
| **Location** | Referenced by bookings (pickup/dropoff) and cross-links. |
| **BlogPost** | Published URLs may be indexed by search engines. Soft delete allows un-publishing without 404s (can show an "archived" message or redirect). |
| **User** | Referenced by audit logs, media uploads, and bookings (assigned driver). Deleting would orphan critical records. |
| **MediaItem** | Referenced by vehicles, blog posts, hero slides, brands, settings. Deleting an image that's still referenced would break pages. Soft delete ensures the reference stays valid until all usages are cleaned up. |
| **Booking** | Financial/regulatory record. Must never be fully destroyed. Status lifecycle (cancelled, completed, no_show) handles business logic; soft delete is a safety net. |
| **Quote** | May be linked to a converted booking. Financial record. |

### Entities That Use Hard Delete

| Entity | Reason |
|--------|--------|
| **VehicleImage** | Child of Vehicle — when removing an image from a gallery, the record is truly gone. The referenced MediaItem is NOT deleted (it may be used elsewhere). |
| **LocationPopularRoute** | Child of Location — can be freely added/removed. |
| **VehicleServiceLink / VehicleLocationLink** | Join table rows — removing a cross-link has no history implications. |
| **BlogPostTag** | Join table rows — removing a tag from a post is a simple unlink. |
| **Tag** | Tags with no posts can be cleaned up. Deleting a tag cascades to BlogPostTag join rows. |
| **MediaFolder** | Organizational only. Deleting a folder moves its children to the parent (or root). |
| **Brand** | Simple display entry with no inbound references. |
| **HeroSlide** | Can be freely added/removed. The `status` field (draft/published/archived) handles visibility. |
| **Session / Account / VerificationToken** | Auth.js session management — ephemeral by nature. |

### Entities That Must NEVER Be Deleted

| Entity | Reason |
|--------|--------|
| **AuditLog** | Immutable audit trail. No delete operation should exist in any API or admin UI. Retention policy (e.g., archive after 2 years) is a future concern. |
| **Booking** (completed) | Even soft-delete should require super_admin. Completed bookings are financial records. |
| **GlobalSettings** | Single-row table — deleting it would break the entire site. Only UPDATE is permitted. |
| **Role** (system roles) | Built-in roles (super_admin, admin, editor, viewer) should have an `isSystem` flag that prevents deletion. Custom roles can be deleted. |

### Implementation Pattern

All soft-deletable entities include a `deletedAt DateTime?` column:
- `null` = active record
- Timestamp = soft-deleted at that time
- All queries add `WHERE deletedAt IS NULL` by default
- Prisma middleware or a custom `findMany` wrapper enforces this automatically
- Admin "trash" view queries `WHERE deletedAt IS NOT NULL`
- Permanent purge requires super_admin and runs as a separate, audited action

---

## 7. Media Strategy

### Storage Architecture

```
MediaItem
├── id: cuid
├── filename: String              // Stored filename (slugified + unique suffix)
├── originalFilename: String      // User's upload filename
├── mimeType: String              // image/webp, image/avif, image/jpeg, etc.
├── sizeBytes: Int                // File size in bytes
├── width: Int?                   // Image dimensions (null for non-images)
├── height: Int?
├── alt: Json                     // Localized alt text { en: "...", ar: "...", ... }
├── caption: Json?                // Optional localized caption
├── folderId: String? → MediaFolder
├── type: Enum(image, video, document)
├── variant: Enum?(original, desktop, mobile, thumbnail, og)
├── storageProvider: Enum(local, s3, r2)
├── storagePath: String           // Full path within the provider
├── url: String                   // Public-facing URL
├── blurhash: String?             // BlurHash placeholder for progressive loading
├── uploadedById: String → User
├── deletedAt: DateTime?
├── createdAt, updatedAt
```

### Image Variant Strategy

For responsive images (desktop/mobile hero, vehicle gallery, blog), the system stores **multiple MediaItem rows** linked to the same logical image set:

```
// Vehicle hero: admin uploads one high-res image
// System auto-generates variants:
MediaItem { variant: "original",  storagePath: "fleet/escalade/hero.webp",        width: 3840, height: 2160 }
MediaItem { variant: "desktop",   storagePath: "fleet/escalade/hero-desktop.webp", width: 1920, height: 1080 }
MediaItem { variant: "mobile",    storagePath: "fleet/escalade/hero-mobile.webp",  width: 768,  height: 1024 }
MediaItem { variant: "thumbnail", storagePath: "fleet/escalade/hero-thumb.webp",   width: 400,  height: 300  }
MediaItem { variant: "og",        storagePath: "fleet/escalade/hero-og.webp",      width: 1200, height: 630  }
```

- Vehicle and Location entities store separate `heroDesktopImageId` and `heroMobileImageId` FK columns, each pointing to a MediaItem.
- VehicleImage rows link to one MediaItem each (the system-generated `desktop` variant); `<picture>` + `<source>` tags on the frontend select the correct variant.

### Format Support

| Format | Use Case | Priority |
|--------|----------|----------|
| WebP | Default output for all uploads | Current |
| AVIF | Higher compression, smaller files | Phase 4 (when browser support matures) |
| JPEG | Fallback for browsers without WebP | Current |
| PNG | Logos, icons, graphics with transparency | Current |
| SVG | Brand logos, icons | Current |

On upload, the system generates WebP variants automatically. Original files are always preserved. AVIF generation can be enabled later as a background job.

### Folder Structure (Default)

```
MediaFolder tree:
├── Fleet
│   ├── Mercedes-Maybach S-Class
│   ├── Mercedes S-Class
│   └── ... (one subfolder per vehicle)
├── Services
├── Locations
├── Blog
├── Homepage
│   ├── Hero
│   └── CTA
├── Brands
└── About
```

Folders are organizational — they have no effect on storage paths or URLs. Admins can create, rename, and reorganize folders freely.

### Usage Tracking

When a MediaItem is referenced by any entity (vehicle image, blog featured image, hero slide, etc.), the admin UI should show where it's used before allowing deletion. This is implemented as a **reverse-lookup query** at delete time, not a separate tracking table:

```sql
-- Before deleting media item 'xyz':
SELECT 'vehicle_image' as source, vi."vehicleId" as entityId FROM "VehicleImage" vi WHERE vi."mediaId" = 'xyz'
UNION ALL
SELECT 'blog_featured', bp.id FROM "BlogPost" bp WHERE bp."featuredImageId" = 'xyz'
UNION ALL
SELECT 'hero_desktop', hs.id FROM "HeroSlide" hs WHERE hs."desktopImageId" = 'xyz'
UNION ALL
SELECT 'hero_mobile', hs.id FROM "HeroSlide" hs WHERE hs."mobileImageId" = 'xyz'
UNION ALL
SELECT 'settings_logo', gs.id FROM "GlobalSettings" gs WHERE gs."logoId" = 'xyz'
-- ... etc.
```

If any rows are returned, the admin sees "This file is used in 3 places" with links, and must confirm before proceeding.

### Cloud Storage Migration Path

Phase 2 starts with `storageProvider = 'local'` (files in a non-public directory, served through an API route or Next.js image optimization). The `storagePath` and `url` columns abstract the provider — switching to S3 or Cloudflare R2 later is a configuration change + a migration script that:
1. Uploads all local files to the cloud bucket
2. Updates `storageProvider`, `storagePath`, and `url` for each row
3. Verifies all URLs resolve
4. Removes local files

No schema changes required.

---

## 8. Translation Strategy

### Two-Layer Architecture

The project uses two independent translation systems, and the database design preserves both:

#### Layer 1: UI Strings (next-intl — unchanged)

```
messages/
  en/common.json    ← "Book Now", "Contact Us", "Fleet", nav labels, form labels
  ar/common.json
  ...
```

- **12 namespaces × 6 locales = 72 JSON files**
- These are **build-time** translations compiled into the Next.js bundle
- They power component UI text: buttons, labels, headings, validation messages, navigation
- They are NOT stored in the database
- The future **Translation Manager** admin module edits these JSON files (via the filesystem or a git-backed workflow), then triggers a rebuild

#### Layer 2: Content Text (JSONB columns — database)

```sql
-- Every localized content field is a JSONB column holding a Localized<T> object:
Vehicle.tagline = {"en": "The pinnacle of luxury", "ar": "قمة الفخامة", ...}
Vehicle.features = {"en": ["Massage seats", "..."], "ar": ["مقاعد مساج", "..."], ...}
Service.longDescription = {"en": ["Paragraph 1...", "..."], "ar": ["الفقرة 1...", "..."], ...}
```

- These are **runtime** translations fetched from the database per request
- They power content: vehicle descriptions, service copy, blog posts, FAQs, hero text
- Each localized field stores all 6 locale values in one JSONB column
- Application code reads `field[locale]` — identical to the current `Localized<T>` pattern

### Why JSONB Over a Translation Table

| Approach | Pros | Cons |
|----------|------|------|
| **JSONB column per field** (chosen) | Matches existing `Localized<T>` pattern exactly. Single query fetches entity with all translations. No JOINs. Easy to add new locales (add a key). Prisma `Json` type works out of the box. | Cannot index individual locale values for full-text search without expression indexes. All locales loaded even when only one is needed (mitigated by caching). |
| **Translation table** (rows per locale per field) | Can index per-locale for full-text search. More normalized. | Massive JOIN complexity — a Vehicle with 8 localized fields × 6 locales = 48 translation rows per vehicle. Query complexity explodes. Doesn't match existing code patterns. |

JSONB wins because:
1. Content is always edited with all locales visible (admin form with tabs per language)
2. Content is fetched for a single locale at render time — a thin accessor `entity.tagline[locale]` is trivial
3. PostgreSQL supports GIN indexes on JSONB for the rare full-text-search-in-specific-locale case
4. Adding a 7th locale means adding a key to each JSONB value — no schema migration

### Handling Localized Arrays

Fields like `features`, `whyChoose`, `benefits`, `tags`, and `content` blocks are `Localized<string[]>` or `Localized<ContentBlock[]>`. These are stored as nested JSONB:

```json
{
  "en": ["Feature 1", "Feature 2", "Feature 3"],
  "ar": ["ميزة 1", "ميزة 2", "ميزة 3"],
  "ru": ["Особенность 1", "Особенность 2", "Особенность 3"],
  "zh": ["特点1", "特点2", "特点3"],
  "fr": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
  "de": ["Merkmal 1", "Merkmal 2", "Merkmal 3"]
}
```

The admin UI renders this as a list editor with locale tabs — each locale can have a different number of items (though typically they mirror each other).

### Adding New Locales

1. Add the new locale code to `i18n/routing.ts` (e.g., `"es"`)
2. Create `messages/es/*.json` files for UI strings
3. For existing content: run a script that adds an empty `"es": ""` key to every JSONB field (or copies from `"en"` as a starting point for translators)
4. No schema migration — JSONB is schema-free

### Compatibility with Existing next-intl

The database design does NOT replace next-intl. The two systems coexist:

- `useTranslations("home.hero")` → reads from `messages/en/home.json` (compile-time)
- `vehicle.tagline[locale]` → reads from JSONB column in database (runtime)

The public site's `[locale]` routing, middleware locale detection, and `<html dir>` handling remain unchanged.

---

## 9. SEO Strategy

### Architecture: Embedded SEO Fields

Each content entity that renders a public page embeds its SEO metadata as a JSONB column:

```
Vehicle.seo = {
  "title":       { "en": "Mercedes S-Class Chauffeur Dubai | Apex Limo", "ar": "...", ... },
  "description": { "en": "Book a Mercedes S-Class with private chauffeur in Dubai...", "ar": "...", ... },
  "keywords":    { "en": ["mercedes s class dubai", "chauffeur dubai"], "ar": [...], ... },
  "ogImageId":   "media_item_cuid",
  "canonical":   null,
  "noIndex":     false,
  "noFollow":    false,
  "structuredData": null
}
```

### Why Embedded Over a Polymorphic SEO Table

| Approach | Verdict |
|----------|---------|
| **JSONB field on each entity** (chosen) | Always loaded with the entity (zero additional queries). Matches the current `buildMetadata()` pattern where each page builds its own metadata from the entity's data. No JOIN. Admin form shows SEO fields alongside content fields naturally. |
| **Polymorphic SeoMetadata table** | Requires an extra JOIN for every page render. Polymorphic `entityType + entityId` can't have foreign key constraints. Adds complexity for no querying benefit (SEO metadata is never queried independently). |

### SEO Fields Per Entity

| Entity | Has SEO | Notes |
|--------|---------|-------|
| Vehicle | Yes | Title, description, keywords, OG image. Structured data (Product + AggregateRating) auto-generated from vehicle data. |
| Service | Yes | Title, description, keywords. Structured data (Service + FAQPage) auto-generated. |
| Location | Yes | Title, description, keywords. Structured data (LocalBusiness + FAQPage) auto-generated. |
| BlogPost | Yes | seoTitle and seoDescription are separate from the display title/excerpt (current pattern). Structured data (Article + FAQPage) auto-generated. |
| VehicleCategory | Via GlobalSettings | Category pages use a template pattern: "Luxury {Category} Fleet Dubai" — managed in settings. |
| Homepage | Via GlobalSettings | Default SEO in GlobalSettings covers the homepage. |

### Default SEO in GlobalSettings

```
GlobalSettings.defaultSeo = {
  "titleTemplate":  { "en": "%s | Apex Limo & Chauffeur Dubai", ... },
  "description":    { "en": "Apex Limo & Chauffeur Dubai delivers luxury...", ... },
  "keywords":       { "en": ["chauffeur service Dubai", "limo service Dubai", ...], ... },
  "ogImageId":      "default_og_media_id",
  "twitterHandle":  null,
  "googleVerification": null,
  "bingVerification": null,
  "robotsOverrides": null
}
```

The `titleTemplate` uses a `%s` placeholder, matching Next.js metadata's `title.template` pattern — identical to the current `getDefaultMetadata()` function.

### Preserved SEO Features

| Feature | Current Implementation | Database Implementation |
|---------|----------------------|------------------------|
| Canonical URLs | `buildMetadata()` generates per locale | Same — generated from slug + locale at render time |
| Hreflang alternates | Generated from routing.locales | Same — routing config unchanged |
| OG images | Default `/og-image.jpg` + per-entity overrides | `ogImageId` FK to MediaItem; falls back to default in GlobalSettings |
| JSON-LD Organization | Hard-coded from SITE constants | Generated from GlobalSettings data |
| JSON-LD FAQPage | Built from entity's FAQ array | Built from Faq table query |
| JSON-LD Article | Built from BlogPost data | Same — from database BlogPost |
| JSON-LD BreadcrumbList | Built from route path | Same — route-based, not data-dependent |
| JSON-LD AggregateRating | Built from TESTIMONIALS | Built from Testimonial table aggregate |
| Sitemap | Generated from data file arrays | Generated from database queries |
| Robots.txt | Static, disallows /api/ | Add disallow for /admin/ |

### Future SEO Manager Admin Features

- **Bulk SEO audit:** Query all entities where `seo.title` or `seo.description` for any locale is null or too short/long
- **Redirect manager:** A future `Redirect` table (fromPath → toPath, statusCode) for managing 301/302 redirects without code changes
- **Sitemap priority overrides:** Optional `sitemapPriority` and `sitemapChangeFreq` fields on each entity

---

## 10. Settings Strategy

### Single-Row GlobalSettings Table

```
GlobalSettings (exactly one row, enforced by application logic)
│
├── companyName: String                    "Apex Limo & Chauffeur Dubai"
├── shortName: String                      "Apex Limo"
├── phone: String                          "+971529426152"
├── phoneDisplay: String                   "+971 52 942 6152"
├── whatsapp: String                       "+971529426152"
├── email: String                          "apexchauffeurdubai@gmail.com"
├── address: Json (Localized)              { "en": "Dubai, UAE", "ar": "...", ... }
├── defaultCurrency: String                "AED"
├── timezone: String                       "Asia/Dubai"
├── fleetSizeDisplay: String               "50+"
├── ratingDisplay: String                  "4.9"
│
├── socialLinks: Json                      {
│   │                                        "googleBusiness": "https://maps.app.goo.gl/...",
│   │                                        "instagram": "https://www.instagram.com/...",
│   │                                        "facebook": "https://www.facebook.com/...",
│   │                                        "twitter": null,
│   │                                        "linkedin": null,
│   │                                        "youtube": null,
│   │                                        "tiktok": null
│   │                                      }
│
├── businessHours: Json                    {
│   │                                        "monday":    { "open": "08:00", "close": "22:00" },
│   │                                        "tuesday":   { "open": "08:00", "close": "22:00" },
│   │                                        ...
│   │                                        "is24_7": false
│   │                                      }
│
├── footer: Json                           {
│   │                                        "copyrightText": { "en": "© 2026 Apex Limo...", ... },
│   │                                        "columns": [...]
│   │                                      }
│
├── defaultSeo: Json                       (see SEO Strategy section)
│
├── logoId: String? → MediaItem
├── faviconId: String? → MediaItem
│
├── notificationEmail: String              "apexchauffeurdubai@gmail.com"
├── whatsappGreeting: Json (Localized)     Default WhatsApp greeting message
│
├── createdAt, updatedAt
```

### Why Single-Row Over Key-Value

| Approach | Pros | Cons |
|----------|------|------|
| **Single-row table** (chosen) | Type-safe columns. One query loads everything. Schema documents the shape. Prisma types auto-generated. Easy to validate. | Adding a new setting requires a migration (acceptable — new settings are rare and should be deliberate). |
| **Key-value (setting_key, setting_value)** | No migration to add settings. Infinitely extensible. | Loses type safety. Multiple queries or complex pivot. Value is always a string — needs parsing. Schema is invisible. Hard to validate. |

Settings change rarely (company phone number, social links). A migration to add a column is a small, safe operation. The type-safety and auto-completion benefits of a typed table far outweigh the flexibility of key-value for this use case.

### Settings Caching

GlobalSettings is read on **every page render** (header phone number, footer, WhatsApp link, etc.). The query:

```sql
SELECT * FROM "GlobalSettings" LIMIT 1
```

is cached at the application level with a short TTL (e.g., 60 seconds) or invalidated on admin save. This pattern means the database is hit at most once per minute, not once per page view.

### Migration from Current Constants

| Current | Database Column |
|---------|----------------|
| `SITE.name` | `companyName` |
| `SITE.shortName` | `shortName` |
| `SITE.phone` | `phone` |
| `SITE.phoneDisplay` | `phoneDisplay` |
| `SITE.whatsapp` | `whatsapp` |
| `SITE.email` | `email` |
| `SOCIAL_PROFILES.*` | `socialLinks` (JSONB) |
| `RATING` | `ratingDisplay` |
| `FLEET_SIZE` | `fleetSizeDisplay` |
| `BRAND_COLORS` | Stays in code — design tokens, not business content |
| `NAV_LINKS` | Stays in code — route structure is an application concern |
| `PRIMARY_CTA` | Stays in code — CTA routes are tied to page routing |

### Future Settings Expansion

Future settings (Stripe keys, WhatsApp API config, CRM webhook URLs) will be added as columns or as a dedicated `IntegrationSettings` table — never stored in the same row as public-facing business information, since integration credentials have different access-control requirements.

---

## 11. Scalability Review

### Target Scale

| Dimension | Target | Assessment |
|-----------|--------|------------|
| Vehicles | 1,000+ | No concern. The Vehicle table with JSONB localized fields and a handful of child rows (images, FAQs) is well within PostgreSQL's comfort zone. A `WHERE status = 'published' AND categoryId = ? ORDER BY sortOrder` query on 1,000 rows is instantaneous with the recommended index. |
| Bookings | 10,000+ | No concern. Bookings are a simple, flat table with well-indexed status and date columns. PostgreSQL handles millions of rows in tables like this. Partitioning by date is overkill until 1M+ rows. |
| Blog posts | 500+ | No concern. Same indexed slug/status/date pattern as bookings. Content blocks as JSONB mean no additional JOINs. |
| Media library | 10,000+ items | Moderate concern. The trigram index on `originalFilename` enables substring search at scale. Folder browsing is indexed by `folderId`. The main risk is storage cost, not query performance — addressed by cloud storage migration. |
| Admin users | 50+ | No concern. Trivial table size. |
| FAQs | 500+ | No concern. Unified FAQ table with composite indexes on entity FKs. |
| Audit logs | 100,000+ | Needs attention at ~1M rows. The `createdAt DESC` index keeps recent-activity queries fast. After 1M rows, consider a time-based retention policy (archive to cold storage after 2 years) or table partitioning by month. |
| Testimonials | 1,000+ | No concern. Small, flat table. |
| Concurrent admin users | 10-20 | No concern. PostgreSQL handles hundreds of concurrent connections. |

### Query Performance Estimates

| Query | Expected Rows Scanned | Method |
|-------|----------------------|--------|
| Published vehicles by category | Index scan (10-50 rows) | Composite index |
| Vehicle detail by slug | Index seek (1 row) | Unique index |
| Recent bookings page | Index scan (25 rows) | Composite index + LIMIT |
| All bookings for email | Index scan (1-100 rows) | Email index |
| FAQ hub page (all FAQs) | Sequential scan (100-500 rows) | Acceptable — single table, cached |
| Media folder browse | Index scan (20-50 rows) | Folder index + LIMIT |
| Audit log for entity | Index scan (10-100 rows) | Composite entity index |

### Read/Write Ratio

This application is **heavily read-biased** (public website rendering) with infrequent writes (admin content changes, booking submissions). This is ideal for:

- **Aggressive caching** — CDN caching for public pages, application-level caching for settings/navigation data
- **Read replicas** — if needed in the future, a read replica can serve all public page queries
- **ISR (Incremental Static Regeneration)** — Next.js can statically generate and revalidate content pages, reducing database load to near-zero for public traffic

### Future Mobile App API

The entity structure supports a REST or GraphQL API without changes:
- Entities have stable IDs (CUID) suitable for API resources
- Pagination is built into the type system (`PaginatedResult<T>`)
- JSONB localized fields can be unwrapped server-side to return only the requested locale

### Future CRM Integration

The Booking and Quote entities include all fields needed for CRM sync:
- Customer contact info (fullName, email, phone)
- Service/vehicle references
- Status lifecycle
- Internal notes
- Reference numbers for cross-system linking

A future `CrmSyncLog` table can track which bookings/quotes have been synced and their external IDs.

---

## 12. Risks & Recommendations

### Risk 1: JSONB vs. Structured Columns for Localized Content

**Risk:** JSONB columns are schema-free — a typo in a locale key (e.g., `"enn"` instead of `"en"`) won't be caught by the database. Missing locale keys produce silent `undefined` at render time.

**Mitigation:**
- Application-level validation in all write paths (server actions, admin forms) ensures every JSONB localized field contains exactly the expected locale keys.
- A Zod schema matching the `Localized<T>` type validates before database write.
- A periodic "translation completeness" admin report flags entities where any locale key is missing or empty.

### Risk 2: Data Migration from File-Based Content

**Risk:** The initial migration from `data/*.ts` files to the database must be lossless — every vehicle, service, location, blog post, FAQ, testimonial, and cross-link must transfer perfectly, or the public site breaks.

**Mitigation:**
- Write the seed script to read directly from the existing `data/*.ts` files (import them as modules) rather than re-typing the data, eliminating transcription errors.
- Run the seed script in a test database first and compare entity counts and spot-check content.
- Implement a dual-read pattern during transition: public pages read from the database with file-based fallback. Once verified, remove the fallback.

### Risk 3: Image Migration Complexity

**Risk:** 100+ images in `public/images/` need to become MediaItem rows with correct alt text, folder assignment, and entity references. The current alt text is localized per image and embedded in data files — this must be extracted and stored in the MediaItem's `alt` JSONB column.

**Mitigation:**
- The seed script iterates each data file's image fields, creates a MediaItem row per image, copies the localized alt text, and updates the parent entity's image FK — all in one transaction.
- For Phase 2 (local storage), images stay in `public/images/` and the MediaItem.url points to the same path. No file moves needed initially.

### Risk 4: FAQ Hub Query Complexity

**Risk:** The FAQ hub page currently merges FAQs from 4 data sources. With the unified FAQ table and nullable FKs, a single query returns all FAQs — but the CHECK constraint (at most one FK non-null) adds insertion complexity.

**Mitigation:**
- Prisma middleware or a custom helper function enforces the at-most-one-FK constraint before insert/update, with a clear error message.
- A PostgreSQL CHECK constraint provides a database-level safety net:
  ```sql
  CHECK (
    (CASE WHEN "vehicleId" IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN "serviceId" IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN "locationId" IS NOT NULL THEN 1 ELSE 0 END) <= 1
  )
  ```

### Risk 5: Admin Route Protection Before Auth.js

**Risk:** `app/admin/` routes will exist and serve real data before Auth.js is implemented in Phase 3.

**Recommendation:**
- Phase 2 admin routes should be protected by a simple middleware check: an `ADMIN_SECRET` environment variable compared against a session cookie set by a bare-bones login page.
- This is a stopgap — NOT a production auth system. It prevents public access without the complexity of Auth.js.
- Phase 3 replaces this with Auth.js and proper RBAC.

### Risk 6: Blog Content Block Schema Evolution

**Risk:** The `BlogContentBlock` discriminated union is stored as JSONB. If the block types evolve (e.g., adding "video", "gallery", "callout"), existing content must still render correctly.

**Mitigation:**
- The renderer already handles unknown block types gracefully (the current `BlogArticleContent.tsx` uses a switch with no default case — it should add a default that renders nothing or a placeholder).
- New block types are additive — existing blocks are never modified. Backward compatibility is inherent in the discriminated-union pattern.

### Risk 7: Soft Delete Leaking Into Public Queries

**Risk:** A missed `WHERE deletedAt IS NULL` in any public-facing query would expose soft-deleted content.

**Mitigation:**
- Use Prisma middleware to automatically add `deletedAt: null` to every `findMany`/`findFirst`/`findUnique` call by default.
- Expose a `withDeleted()` helper that explicitly opts out of the filter for admin "trash" views.
- Add integration tests that verify soft-deleted entities do not appear on any public page.

### Risk 8: GlobalSettings Cache Staleness

**Risk:** If GlobalSettings is cached aggressively (60-second TTL), an admin changing the phone number waits up to 60 seconds to see it on the public site.

**Mitigation:**
- On save, the admin settings form calls `revalidateTag('global-settings')` (Next.js cache tag invalidation) to bust the cache immediately.
- The 60-second TTL is a fallback, not the primary invalidation mechanism.

---

## 13. Database Roadmap for Phase 2B

### Phase 2B: Schema & Migration (next phase after approval)

**Step 1: Install Prisma**
```
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

**Step 2: Write Prisma Schema**

Create models in this dependency order (no forward references):

1. `Role` (no dependencies)
2. `User` (depends on Role)
3. `Account`, `Session`, `VerificationToken` (depend on User — Auth.js adapter models)
4. `MediaFolder` (self-referencing)
5. `MediaItem` (depends on MediaFolder, User)
6. `GlobalSettings` (depends on MediaItem)
7. `VehicleCategory` (no dependencies)
8. `Vehicle` (depends on VehicleCategory)
9. `VehicleImage` (depends on Vehicle, MediaItem)
10. `Service` (no dependencies beyond MediaItem for imageId)
11. `Location` (depends on MediaItem)
12. `LocationPopularRoute` (depends on Location)
13. `FaqCategory` (no dependencies)
14. `Faq` (depends on FaqCategory, Vehicle, Service, Location)
15. `BlogCategory` (no dependencies)
16. `Tag` (no dependencies)
17. `BlogPost` (depends on BlogCategory, MediaItem)
18. `BlogPostTag` (depends on BlogPost, Tag)
19. `HeroSlide` (depends on MediaItem)
20. `Testimonial` (no dependencies)
21. `Brand` (depends on MediaItem)
22. `Booking` (depends on Vehicle — nullable FK for now)
23. `Quote` (depends on Booking for convertedBookingId — nullable)
24. `ContactSubmission` (no dependencies)
25. `VehicleServiceLink` (depends on Vehicle, Service)
26. `VehicleLocationLink` (depends on Vehicle, Location)
27. `AuditLog` (depends on User — nullable, for system actions)

**Step 3: Generate & Apply Migration**
```
npx prisma migrate dev --name init
```

**Step 4: Write Seed Script**

The seed script imports from existing `data/*.ts` files and populates the database:

```
Priority order:
1. GlobalSettings (from lib/constants.ts)
2. FaqCategories (from data/faqHub.ts FAQ_CATEGORIES)
3. VehicleCategories (derived from data/fleet.ts FleetCategory type + "Electric")
4. MediaItems + MediaFolders (from public/images/ directory scan)
5. Vehicles + VehicleImages (from data/fleet.ts FLEET array)
6. Services (from data/services.ts SERVICES array)
7. Locations + LocationPopularRoutes (from data/locations.ts LOCATIONS array)
8. BlogCategories + Tags (derived from blog content)
9. BlogPosts + BlogPostTags (from data/blog.ts BLOG_POSTS array)
10. FAQs — all sources:
    - Homepage FAQs (from data/faqs.ts)
    - Vehicle FAQs (from each vehicle's faqs array)
    - Service FAQs (from each service's faqs array)
    - Service listing FAQs (from data/servicesFaqs.ts)
    - Location FAQs (from each location's faqs array)
    - Hub FAQs (from data/faqHub.ts NEW_FAQS)
11. Testimonials (from data/testimonials.ts)
12. Brands (from data/brands.ts)
13. VehicleServiceLinks + VehicleLocationLinks (from lib/cross-links.ts)
14. Default admin user + roles
```

**Step 5: Verify Seed Integrity**

Automated checks after seeding:
- Vehicle count matches `FLEET.length`
- Service count matches `SERVICES.length`
- Location count matches `LOCATIONS.length`
- Blog post count matches `BLOG_POSTS.length`
- FAQ count matches total across all sources
- Every vehicle slug is unique
- Every media item URL resolves to a file on disk
- Every localized JSONB field has all 6 locale keys

### Phase 2C: Data Access Layer

Build the read-only data layer for the public site:
- Create `lib/db/client.ts` (Prisma client singleton)
- Create query functions per entity (e.g., `getPublishedVehicles()`, `getVehicleBySlug()`)
- Add caching with `unstable_cache` or React cache
- Implement dual-read: try database first, fall back to file data if database is empty
- Update page components to use database queries instead of direct file imports
- Verify: every public page renders identically from database as from files

### Phase 2D: Admin Panel CRUD

Build the admin write layer:
- Server actions for create/update/delete per entity
- Media upload endpoint with variant generation
- Form validation with Zod schemas matching entity types
- Audit log middleware (automatic on every write)
- Settings management page

### Phase 3: Auth & RBAC

- Install and configure Auth.js
- Implement role-based access control using the Role/permissions model
- Protect admin routes
- Build user management UI

---

## Appendix A: Complete Column Reference

### Vehicle

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key |
| slug | String | No | Unique, URL-safe |
| name | String | No | Invariant proper noun (e.g., "Mercedes-Maybach S-Class") |
| brand | String | No | Manufacturer (e.g., "Mercedes-Maybach") |
| model | String | No | Model name (e.g., "S-Class") |
| categoryId | String | No | FK → VehicleCategory |
| isElectric | Boolean | No | Default false |
| passengers | Int | No | Max passenger count |
| luggage | Int | No | Luggage capacity indicator |
| tagline | Json | No | Localized<string> |
| description | Json | No | Localized<string> |
| longDescription | Json | No | Localized<string> |
| idealFor | Json | No | Localized<string> |
| features | Json | No | Localized<string[]> |
| whyChoose | Json | No | Localized<string[]> |
| badge | Json | Yes | Localized<string> or null |
| isPlaceholder | Boolean | No | Default false |
| rates | Json | No | VehicleRates object |
| seo | Json | No | SeoFields object |
| status | Enum | No | draft / published / archived |
| publishedAt | DateTime | Yes | |
| sortOrder | Int | No | Default 0 |
| deletedAt | DateTime | Yes | Soft delete |
| createdAt | DateTime | No | |
| updatedAt | DateTime | No | |

### Booking

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key |
| reference | String | No | Unique (e.g., "APX-L8K3J2A1-F9Q2") |
| status | Enum | No | pending / confirmed / in_progress / completed / cancelled / no_show |
| source | Enum | No | website / whatsapp / phone / email / admin / crm |
| fullName | String | No | |
| phone | String | No | |
| email | String | No | |
| pickupLocation | String | No | |
| dropoffLocation | String | No | |
| date | DateTime | No | Trip date |
| time | String | No | Trip time |
| vehicleId | String | Yes | FK → Vehicle (nullable — vehicle may be soft-deleted) |
| vehicleLabel | String | No | Snapshot of vehicle name at booking time |
| passengers | Int | No | |
| hours | String | No | |
| specialRequests | String | No | Default "" |
| totalAmount | Decimal | Yes | |
| currency | String | No | Default "AED" |
| paymentStatus | Enum | No | pending / partial / paid / refunded |
| driverId | String | Yes | FK → User (future) |
| customerId | String | Yes | FK → Customer (future) |
| internalNotes | String | No | Default "" |
| locale | String | No | Locale at submission time |
| ipAddress | String | Yes | For rate-limit auditing |
| deletedAt | DateTime | Yes | |
| createdAt | DateTime | No | |
| updatedAt | DateTime | No | |

### BlogPost

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key |
| slug | String | No | Unique |
| title | Json | No | Localized<string> |
| excerpt | Json | No | Localized<string> |
| content | Json | No | ContentBlock[] (discriminated union array) |
| author | Json | No | { name, title: Localized, email? } |
| categoryId | String | Yes | FK → BlogCategory |
| featuredImageId | String | Yes | FK → MediaItem |
| seo | Json | No | SeoFields object |
| readingTimeMinutes | Int | No | Computed on save |
| status | Enum | No | draft / published / archived |
| publishedAt | DateTime | Yes | |
| sortOrder | Int | No | Default 0 |
| deletedAt | DateTime | Yes | |
| createdAt | DateTime | No | |
| updatedAt | DateTime | No | |

### MediaItem

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key |
| filename | String | No | Stored filename (slugified) |
| originalFilename | String | No | Upload filename |
| mimeType | String | No | e.g. "image/webp" |
| sizeBytes | Int | No | |
| width | Int | Yes | Null for non-images |
| height | Int | Yes | |
| alt | Json | No | Localized<string> — default empty per locale |
| caption | Json | Yes | Localized<string> or null |
| folderId | String | Yes | FK → MediaFolder |
| type | Enum | No | image / video / document |
| variant | Enum | Yes | original / desktop / mobile / thumbnail / og |
| storageProvider | Enum | No | local / s3 / r2 |
| storagePath | String | No | Full path within provider |
| url | String | No | Public URL |
| blurhash | String | Yes | Progressive loading placeholder |
| uploadedById | String | Yes | FK → User |
| deletedAt | DateTime | Yes | |
| createdAt | DateTime | No | |
| updatedAt | DateTime | No | |

### GlobalSettings

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key (single row) |
| companyName | String | No | |
| shortName | String | No | |
| phone | String | No | |
| phoneDisplay | String | No | |
| whatsapp | String | No | |
| email | String | No | |
| address | Json | No | Localized<string> |
| defaultCurrency | String | No | "AED" |
| timezone | String | No | "Asia/Dubai" |
| fleetSizeDisplay | String | No | "50+" |
| ratingDisplay | String | No | "4.9" |
| socialLinks | Json | No | SocialLinks object |
| businessHours | Json | Yes | BusinessHours object |
| footer | Json | No | FooterSettings object |
| defaultSeo | Json | No | DefaultSeoSettings object |
| logoId | String | Yes | FK → MediaItem |
| faviconId | String | Yes | FK → MediaItem |
| notificationEmail | String | No | |
| whatsappGreeting | Json | Yes | Localized<string> |
| createdAt | DateTime | No | |
| updatedAt | DateTime | No | |

### AuditLog

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | String (CUID) | No | Primary key |
| action | Enum | No | create / update / delete / publish / unpublish / archive / restore / login / logout / settings_change |
| entityType | String | No | "vehicle", "booking", etc. |
| entityId | String | No | ID of the affected entity |
| userId | String | Yes | FK → User (null for system actions) |
| userName | String | No | Snapshot of user name at action time |
| changes | Json | No | Array of { field, before, after } |
| ipAddress | String | Yes | |
| userAgent | String | Yes | |
| createdAt | DateTime | No | Immutable — no updatedAt |

---

## Verification Checklist

- [x] No production code modified
- [x] Public website unchanged
- [x] No Prisma schema created
- [x] No migration generated
- [x] No database created
- [x] Documentation complete — all 13 output sections delivered
- [x] Entity list covers all admin panel requirements
- [x] Relationships documented with rationale
- [x] Index strategy covers all query patterns
- [x] Soft delete policy defined per entity
- [x] Media strategy supports local → cloud migration
- [x] Translation strategy preserves existing next-intl
- [x] SEO strategy preserves all current SEO features
- [x] Settings strategy covers all business information
- [x] Scalability reviewed for all target dimensions
- [x] Risks identified with mitigations
- [x] Phase 2B roadmap provides implementation order
