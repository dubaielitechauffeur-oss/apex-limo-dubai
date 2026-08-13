/**
 * Canonical permission catalog for the admin panel.
 *
 * Naming convention: `resource:action` — colon-separated, matching the
 * strings already live on `Role.permissions` (seeded by prisma/seed.ts,
 * which imports its role→permission arrays from `./roles` below rather
 * than repeating string literals). This is a deliberate compatibility
 * choice: Phase 2B/2C already seeded and shipped roles using this exact
 * format (`fleet:read`, `bookings:create`, …), and those rows back a real,
 * already-bootstrapped super_admin account. Renaming to dot-notation
 * (`fleet.view`) would require a data migration and re-seed for zero
 * behavioral gain — RBAC.md documents this decision in full.
 *
 * Resource identifiers match `config/modules.ts`'s `MODULE_REGISTRY` ids
 * and `config/admin.ts`'s `ADMIN_NAV` `moduleId` fields one-to-one, so a
 * permission's resource segment always names a real, already-registered
 * module.
 */

export const RESOURCES = [
  "fleet",
  "bookings",
  "quotes",
  "blog",
  "services",
  "locations",
  "faq",
  "media",
  "settings",
  "seo",
  "translations",
  "users",
  "audit",
  "analytics",
  "homepage",
  "pricing",
  "contacts",
] as const;

export type Resource = (typeof RESOURCES)[number];

/**
 * Every permission string that appears anywhere in prisma/seed.ts's role
 * definitions — this catalog is a typed mirror of the already-approved
 * permission model, not a redesign of it. Declaring a constant here makes
 * `requirePermission(PERMISSIONS.FLEET_UPDATE)` (or the equivalent literal
 * `"fleet:update"`) type-check; it says nothing about which roles actually
 * hold it — that's `Role.permissions` in the database, the single source
 * of truth for *grants*, checked fresh per request (see context.ts).
 */
export const PERMISSIONS = {
  FLEET_CREATE: "fleet:create",
  FLEET_READ: "fleet:read",
  FLEET_UPDATE: "fleet:update",
  FLEET_DELETE: "fleet:delete",
  FLEET_PUBLISH: "fleet:publish",

  BOOKINGS_CREATE: "bookings:create",
  BOOKINGS_READ: "bookings:read",
  BOOKINGS_UPDATE: "bookings:update",
  BOOKINGS_DELETE: "bookings:delete",

  QUOTES_CREATE: "quotes:create",
  QUOTES_READ: "quotes:read",
  QUOTES_UPDATE: "quotes:update",
  QUOTES_DELETE: "quotes:delete",

  BLOG_CREATE: "blog:create",
  BLOG_READ: "blog:read",
  BLOG_UPDATE: "blog:update",
  BLOG_DELETE: "blog:delete",
  BLOG_PUBLISH: "blog:publish",

  SERVICES_CREATE: "services:create",
  SERVICES_READ: "services:read",
  SERVICES_UPDATE: "services:update",
  SERVICES_DELETE: "services:delete",
  SERVICES_PUBLISH: "services:publish",

  LOCATIONS_CREATE: "locations:create",
  LOCATIONS_READ: "locations:read",
  LOCATIONS_UPDATE: "locations:update",
  LOCATIONS_DELETE: "locations:delete",
  LOCATIONS_PUBLISH: "locations:publish",

  // Added Phase 7 — FAQs (categories + entries) were always part of
  // content_manager's intended scope (see its ROLE_DESCRIPTIONS entry,
  // written back in Phase 4) but had no dedicated resource until the FAQ
  // CMS existed to need one. No other resource cleanly covers it — FAQs
  // attach to vehicle/service/location or stand alone, not owned by any
  // one of those.
  FAQ_CREATE: "faq:create",
  FAQ_READ: "faq:read",
  FAQ_UPDATE: "faq:update",
  FAQ_DELETE: "faq:delete",

  MEDIA_CREATE: "media:create",
  MEDIA_READ: "media:read",
  MEDIA_UPDATE: "media:update",
  MEDIA_DELETE: "media:delete",

  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",

  SEO_READ: "seo:read",
  SEO_UPDATE: "seo:update",

  TRANSLATIONS_READ: "translations:read",
  TRANSLATIONS_UPDATE: "translations:update",

  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  AUDIT_READ: "audit:read",

  ANALYTICS_READ: "analytics:read",

  HOMEPAGE_CREATE: "homepage:create",
  HOMEPAGE_READ: "homepage:read",
  HOMEPAGE_UPDATE: "homepage:update",
  HOMEPAGE_DELETE: "homepage:delete",
  HOMEPAGE_PUBLISH: "homepage:publish",

  PRICING_CREATE: "pricing:create",
  PRICING_READ: "pricing:read",
  PRICING_UPDATE: "pricing:update",
  PRICING_DELETE: "pricing:delete",

  CONTACTS_READ: "contacts:read",
  CONTACTS_UPDATE: "contacts:update",
  CONTACTS_DELETE: "contacts:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);

export function isValidPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(value);
}

/** The resource segment of a permission string, e.g. `"fleet:read"` → `"fleet"`. */
export function permissionResource(permission: Permission): Resource {
  return permission.split(":")[0] as Resource;
}
