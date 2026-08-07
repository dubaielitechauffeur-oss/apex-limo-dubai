# Media Library

Phase 6 documentation: the enterprise media library and reusable CMS media
infrastructure built on top of Phase 5's admin panel. Read alongside
`ADMIN_PANEL.md` (admin shell/components this reuses), `RBAC.md`
(permission model), and `DATABASE_ARCHITECTURE.md` §7 "Media Strategy" —
this phase implements that section's design as-is, not a new one.

## Scope of this phase

Built: upload (validated, permission-gated), a browsable/searchable/
filterable grid, folders (create/rename/move/delete), per-item metadata
editing (localized alt text + caption, folder, variant), reference-aware
soft-delete, and a storage abstraction ready for S3/R2.

Not built (explicit phase boundary): Fleet/Blog/Services/Locations/Pricing/
Hero/SEO CRUD. Those future modules will pick existing `MediaItem` rows via
their own FK fields (`desktopImageId`, `featuredImageId`, etc. — the pattern
already exists for `HeroSlide` and `Brand`); this phase only makes sure the
media those fields will point to can be uploaded and managed.

## Architecture

```
lib/media/
  constants.ts       Pure data (MAX_UPLOAD_BYTES, allowed MIME types) —
                      safe to import from a "use client" component
  validation.ts       Server-only: magic-byte MIME sniffing, size limit,
                      SVG rejection, filename sanitization
  keys.ts             Storage key generation (year/month/uuid.ext — never
                      derived from user input)
  dimensions.ts       Real width/height from uploaded bytes (image-size)
  guard.ts            requireMediaPermission() — same DB-fresh, non-throwing
                      gate pattern as lib/admin/users.ts / roles-admin.ts
  items.ts            listMedia, getMediaItem, uploadMedia,
                      updateMediaMetadata, findMediaUsage, deleteMedia
  folders.ts          listFolders, createFolder, renameFolder, moveFolder,
                      deleteFolder
  storage/
    types.ts           StorageDriver interface
    local.ts            Local filesystem driver (this phase's only
                      implementation)
    index.ts            getStorageDriver() factory, keyed by the
                      StorageProvider enum

app/uploads/[...path]/route.ts   Public, unauthenticated GET — streams
                                  files the local driver wrote

app/admin/(dashboard)/media/
  page.tsx             Grid + folders + search/filter + pagination
  [id]/page.tsx         Details/edit + delete
  actions.ts            "use server" wrappers (no authorization logic of
                      their own — see Security)

components/admin/media/   MediaGrid, MediaCard, UploadMediaModal,
                          FolderPanel, MediaEditForm, MediaDeleteSection
```

No second permission/navigation system was created. `/admin/media`'s
sidebar entry already existed in Phase 5's `config/admin.ts` `ADMIN_NAV`
(pointing at a placeholder); this phase only replaced the placeholder page
— `filterAdminNav()` and the `media` moduleId → `media:read` mapping in
`lib/permissions/nav.ts` are unchanged.

## Upload flow

1. **Client** (`UploadMediaModal`): picks a file, optional folder, optional
   variant tag; submits via a Server Action (`uploadMediaAction`).
2. **Server Action**: reads the `File` into a `Buffer` — nothing here
   trusts `file.type` or `file.name`'s extension.
3. **`uploadMedia()`** (`lib/media/items.ts`):
   - `requireMediaPermission(MEDIA_CREATE)` — DB-fresh permission check.
   - `validateUpload(buffer)` — sniffs the real format from magic bytes,
     enforces the 10 MB limit, rejects anything unsupported (see Security).
   - `readImageDimensions(buffer)` — real width/height, never guessed.
   - `generateStorageKey(extension)` — `<year>/<month>/<uuid>.<ext>`; the
     extension comes from the *sniffed* MIME type, never the client's
     filename.
   - `getStorageDriver().save(...)` — writes the file, returns
     `{ storagePath, url }`.
   - Creates the `MediaItem` row (localized `alt` seeded from the
     sanitized original filename so nothing ships with empty alt text),
     writes an audit log entry.
4. Every field the browser supplied ends up in exactly two places:
   `MediaItem.originalFilename` (sanitized, display-only) and the
   `alt`/`caption` text the admin edits afterward — never in a filesystem
   path.

## Storage abstraction

`StorageDriver` (`lib/media/storage/types.ts`) is a two-method interface:
`save({ key, buffer, contentType }) -> { storagePath, url }` and
`delete(storagePath)`. `LocalStorageDriver` is the only implementation this
phase ships:

- Files live in `storage/media/` at the repo root — **outside `public/`**,
  matching `DATABASE_ARCHITECTURE.md` §7 ("files in a non-public directory,
  served through an API route"). `storage/media/` is gitignored.
- Served back out by `app/uploads/[...path]/route.ts`, which streams the
  file with a content type derived from its (our own, always-safe)
  extension — never from the filesystem or a client header.
- **Dev/single-instance only.** Writes aren't shared across instances and
  don't survive a redeploy on serverless/multi-instance hosting. This is
  the accepted, documented state for this phase — see "Cloud migration"
  below for what changes before a real production launch.

### Cloud migration path (S3 / Cloudflare R2)

`MediaItem.storageProvider` already has `s3`/`r2` values reserved.
`getStorageDriver("s3")` currently throws a clear "not configured" error
rather than silently writing to local disk. To add a real driver:

1. Create `lib/media/storage/s3.ts` (or `r2.ts`) implementing
   `StorageDriver` — `save()` uploads to the bucket and returns the bucket's
   public/CDN URL as `url`; `delete()` removes the object.
2. Wire it into `getStorageDriver()`'s switch statement.
3. Point `getDefaultStorageProvider()` at the new provider (e.g. via an env
   var) so new uploads use it.
4. Existing `local` rows keep working as-is (their `storageProvider` stays
   `"local"`, still served by `/uploads/...`); a one-off migration script
   can upload each local file to the bucket and flip `storageProvider`/
   `storagePath`/`url` per row if a full cutover is wanted later.

Nothing above the storage layer — `lib/media/items.ts`, the admin UI —
needs to change for this migration.

## MediaFolder

Purely organizational (`DATABASE_ARCHITECTURE.md` §7: "no effect on
storage paths or URLs") — a self-referencing tree via `parentId`, browsed
flat-with-indentation in `FolderPanel`. `moveFolder()` walks the target's
ancestor chain to refuse a move that would create a cycle (a folder into
itself or one of its own descendants). `deleteFolder()` refuses to delete a
non-empty folder (any file or subfolder) — move or delete its contents
first, matching the Phase 6 brief's "delete empty folder safely."

## Image variants

`MediaItem.variant` (`original | desktop | mobile | thumbnail | og`) is a
**tag on an individual row**, not a resize pipeline. This matches the
existing pattern already live in the schema: `HeroSlide.desktopImageId` and
`HeroSlide.mobileImageId` are two separate FK columns, each pointing at its
own `MediaItem` — i.e. "desktop hero image" and "mobile hero image" are
always two different uploaded files, not one file resized two ways. An
admin uploads (or edits) each variant as its own item and tags it
accordingly; a future CMS field's media picker filters by `variant` to
offer the right one. No automatic resizing/derivative generation exists
this phase — see "Deferred" below for why.

## Reference-aware, soft-delete

`findMediaUsage(id)` reverse-looks-up every current FK relation to
`MediaItem` (computed fresh, no tracking table — exactly as
`DATABASE_ARCHITECTURE.md` §7 specifies):

`VehicleImage.mediaId`, `BlogPost.featuredImageId`,
`HeroSlide.desktopImageId`/`mobileImageId`, `Brand.logoId`,
`GlobalSettings.logoId`/`faviconId`.

`deleteMedia()` always **soft-deletes** (`deletedAt`), never touches the
physical file, and shows the usage list in the confirmation dialog first.
This is safe even for a currently-referenced item: every one of those FKs
is `onDelete: SetNull`, but a soft-deleted row is never actually deleted, so
anything still pointing at it keeps rendering the real file. Soft-deleting
only removes the item from the library's browse/search results and stops
it being selectable for new use. A true hard-delete (freeing the physical
file once nothing references it) is deferred — see below.

**Known gap, not fixed this phase:** `Location` and `Service` currently
store image URLs as plain strings (`imageUrl`, `heroDesktopImageUrl`, …),
not a `MediaItem` FK — a pre-existing inconsistency with `Vehicle`/
`BlogPost`/`HeroSlide`/`Brand`. `findMediaUsage()` can't see references from
those two models yet. Migrating them to a proper FK is a schema change for
whichever future phase builds their CMS screens, not this one (per the
brief: "make only the necessary [schema] changes").

## Permissions

Reuses Phase 4's catalog exactly — no new permission was needed:

| Action | Permission |
|---|---|
| View / list / search media, view folders | `media:read` |
| Upload, create folder | `media:create` |
| Edit metadata, rename/move folder | `media:update` |
| Delete media, delete folder | `media:delete` |

Every `lib/media/*` function re-checks its own permission independently
(via `requireMediaPermission`) rather than trusting the page that called
it — the same five-level model `RBAC.md`/`ADMIN_PANEL.md` establish. The
admin UI hides actions a role can't perform, which is convenience only; the
underlying functions are the actual boundary.

## Security review

- **Authentication**: every `/admin/media*` page sits under the `(dashboard)`
  layout (`requireUser()`) and additionally calls `requirePermission()`
  itself; `app/uploads/[...path]/route.ts` is the one deliberately public,
  unauthenticated route (see below).
- **MIME validation**: `sniffImageMimeType()` reads real magic bytes
  (JPEG/PNG/WebP/AVIF signatures) — `File.type` and the filename extension
  are never trusted for anything security-relevant.
- **File size**: `MAX_UPLOAD_BYTES` (10 MB) enforced before any write.
  `next.config.ts`'s `experimental.serverActions.bodySizeLimit` was raised
  to 12 MB — Next's 1 MB default would otherwise reject legitimate photo
  uploads before validation even ran.
- **SVG**: rejected outright. A raw SVG can embed `<script>`/event-handler
  attributes — real stored-XSS risk without a vetted sanitizer (e.g.
  DOMPurify's SVG profile), which this project doesn't have installed or
  audited. This is the explicit "otherwise reject it" fallback the brief
  allows, documented at `lib/media/validation.ts`'s `REJECTED_SVG_REASON`.
- **Path traversal**: storage keys for new uploads are never derived from
  user input (`<year>/<month>/<uuid>.<ext>` only). The one place a "path"
  *is* user input — `/uploads/[...path]`'s URL segments — rejects any
  segment that's empty, `.`, `..`, or contains a null byte, restricts served
  extensions to the four we generate, and independently re-verifies the
  final resolved path stays inside `storage/media/` (`resolveWithinRoot()`)
  regardless of how the traversal attempt was encoded.
- **Direct file access**: files live outside `public/`; the only way to
  reach one is through the route above, which only serves files that were
  already written by a validated upload.
- **Deletion safety**: soft-delete only, usage shown before confirming,
  folder deletion blocked while non-empty.
- **XSS via metadata**: alt/caption text is only ever rendered through
  React's default escaping (`<img alt>`, `<input defaultValue>`) — no
  `dangerouslySetInnerHTML` anywhere in this feature.
- **Server/client boundary**: every "use client" component imports
  `lib/media/items.ts`/`folders.ts` **types only** (`import type`); the one
  runtime value a client component needs (`MAX_UPLOAD_BYTES`) was pulled
  into a dependency-free `lib/media/constants.ts` specifically so no
  Buffer/`fs`/Prisma code from `validation.ts` could end up in the browser
  bundle.
- **Rate limiting**: not added. Upload/folder actions require both
  authentication and a specific permission (unlike the anonymous
  login/forgot-password endpoints `lib/auth/rate-limit.ts` protects), and
  every action is audit-logged with the actor's identity. Revisit if this
  ever becomes a public or lower-trust surface.

## Deferred (documented, not built this phase)

- **Automatic derivative generation** (real resizing into desktop/mobile/
  thumbnail/OG pixel variants, WebP transcoding of JPEG/PNG uploads). The
  brief is explicit about not over-engineering a CDN pipeline this phase;
  `variant` tagging plus manual per-size uploads is the CMS-ready
  foundation, and `DATABASE_ARCHITECTURE.md` §7 itself frames automatic
  AVIF generation as later, background-job work — WebP transcoding is
  deferred on the same reasoning. Adding `sharp` (or another processor)
  later slots in without changing `MediaItem`'s shape.
- **Hard delete / "empty trash."** Soft-delete is the only delete path this
  phase ships. A future action that permanently frees a soft-deleted,
  zero-usage file's physical bytes (`storageDriver.delete(storagePath)`,
  then a real row delete) is a small, isolated addition on top of what's
  here.
- **`blurhash` generation.** The column exists (nullable) and is left
  `null` on every upload; populating it is a small, independent follow-up.
- **`Location`/`Service` → `MediaItem` migration** — see "Known gap" above.

## Future CMS integration

A future module (Fleet, Blog, Homepage hero, …) references media by adding
its own FK column(s) to `MediaItem` — exactly like `HeroSlide.desktopImageId`
/`mobileImageId` and `Brand.logoId` already do — and building a small
"pick from library" UI on top of `listMedia()` (already supports filtering
by `variant`/folder/type, so a picker can scope to e.g. `variant: "og"`
images only). No change to this phase's upload flow, storage layer, or
permission model is needed for that to work.
