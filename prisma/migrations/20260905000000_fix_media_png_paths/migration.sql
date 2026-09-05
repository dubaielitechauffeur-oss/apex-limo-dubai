-- Repoints stored image paths from the removed `.png` originals to the `.webp`
-- files that replaced them.
--
-- WHY: 48 fleet and blog photographs were converted to WebP (105.9 MB -> 15.9
-- MB) and the PNG originals deleted. The `data/*.ts` references were updated
-- alongside them, but the PUBLIC site reads vehicle and blog imagery from the
-- DATABASE — `media_items.url` (via `vehicle_images`/`blog_posts`) and the raw
-- `imageUrl`/`heroDesktopImageUrl`/`heroMobileImageUrl`/`logoUrl` columns. Those
-- rows were written by the import scripts with the original `.png` paths, so
-- every one of them started 404ing when the files went away.
--
-- SCOPE: deliberately narrow. Only rewrites paths that
--   (a) are site-relative — an absolute Vercel Blob URL is left alone, and
--   (b) sit under /images/fleet/ or /images/blog/ — /images/brands/*.png are
--       real files still present on disk (three brand logos kept as PNG
--       because they are flat-colour marks with alpha), and
--   (c) actually end in .png.
--
-- IDEMPOTENT: re-running matches nothing, because the WHERE clauses only ever
-- select rows that still end in `.png`. Safe on an environment that already
-- received the fix by other means.
--
-- A matching rewrite in next.config.ts covers any environment where this
-- migration has not yet been applied, and any external link or cached HTML
-- still pointing at a .png.

-- media_items: the source for vehicle galleries and blog featured images.
UPDATE "media_items"
SET "url"         = regexp_replace("url", '\.png$', '.webp'),
    "storagePath" = regexp_replace("storagePath", '\.png$', '.webp')
WHERE "url" ~ '^/images/(fleet|blog)/.*\.png$';

-- Services: raw fallback column used when no MediaItem relation is set.
UPDATE "services"
SET "imageUrl" = regexp_replace("imageUrl", '\.png$', '.webp')
WHERE "imageUrl" ~ '^/images/(fleet|blog)/.*\.png$';

-- Locations: card image plus the two hero overrides.
UPDATE "locations"
SET "imageUrl"            = regexp_replace("imageUrl", '\.png$', '.webp')
WHERE "imageUrl" ~ '^/images/(fleet|blog)/.*\.png$';

UPDATE "locations"
SET "heroDesktopImageUrl" = regexp_replace("heroDesktopImageUrl", '\.png$', '.webp')
WHERE "heroDesktopImageUrl" ~ '^/images/(fleet|blog)/.*\.png$';

UPDATE "locations"
SET "heroMobileImageUrl"  = regexp_replace("heroMobileImageUrl", '\.png$', '.webp')
WHERE "heroMobileImageUrl" ~ '^/images/(fleet|blog)/.*\.png$';

-- Brands: scoped the same way, so /images/brands/*.png is untouched.
UPDATE "brands"
SET "logoUrl" = regexp_replace("logoUrl", '\.png$', '.webp')
WHERE "logoUrl" ~ '^/images/(fleet|blog)/.*\.png$';
