export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  featurePath: string;
  dependencies: string[];
  phase: number;
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // ── Phase 2: Database & Core CRUD ──────────────────────────────────
  {
    id: "fleet",
    name: "Fleet Management",
    description: "Vehicle CRUD, category assignment, gallery, specs, FAQs",
    featurePath: "features/fleet",
    dependencies: ["media"],
    phase: 2,
  },
  {
    id: "bookings",
    name: "Booking Management",
    description: "Booking lifecycle, status tracking, assignment, notes",
    featurePath: "features/bookings",
    dependencies: ["fleet"],
    phase: 2,
  },
  {
    id: "quotes",
    name: "Quote Management",
    description: "Quote lifecycle, conversion to booking, expiration",
    featurePath: "features/quotes",
    dependencies: ["fleet", "bookings"],
    phase: 2,
  },
  {
    id: "pricing",
    name: "Pricing Management",
    description: "Per-vehicle rates, packages, airport/hourly/daily tiers",
    featurePath: "features/pricing",
    dependencies: ["fleet"],
    phase: 2,
  },
  {
    id: "blog",
    name: "Blog CMS",
    description: "Post CRUD, structured content blocks, categories, tags",
    featurePath: "features/blog",
    dependencies: ["media"],
    phase: 2,
  },
  {
    id: "services",
    name: "Services CMS",
    description: "Service pages, FAQs, cross-links to fleet/locations",
    featurePath: "features/services",
    dependencies: ["media"],
    phase: 2,
  },
  {
    id: "locations",
    name: "Locations CMS",
    description: "Location pages, routes, geo, cross-links to fleet/services",
    featurePath: "features/locations",
    dependencies: ["media"],
    phase: 2,
  },
  {
    id: "faq",
    name: "FAQ CMS",
    description: "FAQ categories and entries, optionally scoped to a vehicle/service/location",
    featurePath: "features/faq",
    dependencies: [],
    phase: 2,
  },
  {
    id: "media",
    name: "Media Library",
    description: "Image upload, folders, desktop/mobile variants, search",
    featurePath: "features/media",
    dependencies: [],
    phase: 2,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Company info, contact, social links, footer configuration",
    featurePath: "features/settings",
    dependencies: [],
    phase: 2,
  },
  {
    id: "homepage",
    name: "Homepage CMS",
    description: "Hero slides, CTA buttons, publish/unpublish",
    featurePath: "features/homepage",
    dependencies: ["media"],
    phase: 2,
  },

  // ── Phase 3: Auth & Access Control ─────────────────────────────────
  {
    id: "users",
    name: "Users & Roles",
    description: "User accounts, role assignment, RBAC permissions",
    featurePath: "features/users",
    dependencies: [],
    phase: 3,
  },
  {
    id: "audit",
    name: "Audit Logs",
    description: "Action tracking, change diffs, user activity history",
    featurePath: "features/audit",
    dependencies: ["users"],
    phase: 3,
  },

  // ── Phase 4: Advanced Features ─────────────────────────────────────
  {
    id: "seo",
    name: "SEO Manager",
    description: "Per-page meta overrides, OG images, structured data, sitemap",
    featurePath: "features/seo",
    dependencies: ["media"],
    phase: 4,
  },
  {
    id: "translations",
    name: "Translation Manager",
    description: "In-admin editing of message namespaces across all locales",
    featurePath: "features/translations",
    dependencies: [],
    phase: 4,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Booking/quote/revenue metrics, top vehicles, conversion rates",
    featurePath: "features/analytics",
    dependencies: ["bookings", "quotes"],
    phase: 4,
  },
  {
    id: "admin",
    name: "Admin Shell",
    description: "Admin layout, sidebar navigation, dashboard overview",
    featurePath: "features/admin",
    dependencies: ["users"],
    phase: 2,
  },
];
