-- Adds the "agency" system role (external SEO agency): full editing of every
-- content module and the SEO Manager, read-only settings and pricing, and no
-- access to bookings, quotes, contacts, users, audit log or analytics.
--
-- Roles are rows, normally written by prisma/seed.ts. Production is not
-- re-seeded on deploy, so the role ships as a migration: without the row the
-- "Invite user" screen would have nothing to offer for it.
--
-- The permission list mirrors ROLE_PERMISSIONS.agency in
-- lib/permissions/roles.ts; lib/permissions/__tests__/roles-seed checks the
-- two never drift. Idempotent: re-running (or a later seed) converges.
INSERT INTO "roles" ("id", "name", "description", "permissions", "isSystem", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'agency',
  'External SEO agency — full editing of SEO, services, locations, fleet, blog, FAQs, homepage and media. Settings and pricing are view-only. No customer data, no users',
  ARRAY[
    'seo:read',
    'seo:update',
    'fleet:create',
    'fleet:read',
    'fleet:update',
    'fleet:delete',
    'fleet:publish',
    'services:create',
    'services:read',
    'services:update',
    'services:delete',
    'services:publish',
    'locations:create',
    'locations:read',
    'locations:update',
    'locations:delete',
    'locations:publish',
    'blog:create',
    'blog:read',
    'blog:update',
    'blog:delete',
    'blog:publish',
    'faq:create',
    'faq:read',
    'faq:update',
    'faq:delete',
    'homepage:create',
    'homepage:read',
    'homepage:update',
    'homepage:delete',
    'homepage:publish',
    'media:create',
    'media:read',
    'media:update',
    'media:delete',
    'translations:read',
    'settings:read',
    'pricing:read'
  ]::text[],
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "permissions" = EXCLUDED."permissions",
  "isSystem" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
