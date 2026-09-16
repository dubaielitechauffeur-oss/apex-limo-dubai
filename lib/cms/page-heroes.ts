import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireCmsPermission } from "./guard";
import { emptyLocalizedText, type LocalizedText } from "./localized";

/**
 * Hero imagery for public pages that have no CMS record of their own.
 *
 * A Service or Location row owns its page's hero, so those are edited on the
 * row itself. The /services and /locations *listing* pages have no row to
 * hang an image on — before this, their heroes were file paths compiled into
 * `ServicesHero.tsx` / `LocationsHero.tsx`, editable only by a developer.
 *
 * Each page here is one row keyed by a fixed slug. The catalog below is the
 * whole set: a page absent from it cannot be edited, and a page in it with no
 * row yet simply renders its component's built-in image. Adding a page later
 * means one entry here plus reading it in that page's component — no schema
 * change, and nothing breaks in between.
 *
 * Permissions ride on the `homepage` resource rather than a new one. This is
 * the same class of thing the Homepage screen already manages (site-page
 * imagery, not a content record), the roles that may edit one should edit the
 * other, and a brand-new permission would be absent from every role already
 * seeded in production — locking everyone out until a re-seed ran.
 */
export const PAGE_HERO_CATALOG = [
  {
    page: "services",
    label: "Services listing",
    description: "The banner at the top of /services, above the six service cards.",
    publicPath: "/services",
  },
  {
    page: "locations",
    label: "Locations listing",
    description: "The banner at the top of /locations, above the six location cards.",
    publicPath: "/locations",
  },
] as const;

export type PageHeroSlug = (typeof PAGE_HERO_CATALOG)[number]["page"];

const VALID_PAGES = new Set<string>(PAGE_HERO_CATALOG.map((entry) => entry.page));

export interface PageHeroItem {
  page: string;
  label: string;
  description: string;
  publicPath: string;
  desktopImageId: string | null;
  mobileImageId: string | null;
  imageAlt: LocalizedText;
}

export interface PageHeroInput {
  desktopImageId: string | null;
  mobileImageId: string | null;
  imageAlt: LocalizedText;
}

/**
 * Every catalog page, whether or not it has a row yet — the admin screen
 * needs a form for each one regardless, and an unsaved page is an empty
 * form rather than a missing card.
 */
export async function listPageHeroes(): Promise<RoleAdminResult<PageHeroItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_READ);
  if (!gate.success) return gate;

  const rows = await prisma.pageHero.findMany();
  const byPage = new Map(rows.map((row) => [row.page, row]));

  return {
    success: true,
    data: PAGE_HERO_CATALOG.map((entry) => {
      const row = byPage.get(entry.page);
      return {
        page: entry.page,
        label: entry.label,
        description: entry.description,
        publicPath: entry.publicPath,
        desktopImageId: row?.desktopImageId ?? null,
        mobileImageId: row?.mobileImageId ?? null,
        imageAlt: (row?.imageAlt as LocalizedText | null) ?? emptyLocalizedText(),
      };
    }),
  };
}

export async function updatePageHero(page: string, input: PageHeroInput): Promise<RoleAdminResult<{ page: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.HOMEPAGE_UPDATE);
  if (!gate.success) return gate;

  // The page slug comes from a form field, so it is checked against the
  // catalog rather than trusted — an arbitrary value would otherwise create
  // a row no public page ever reads.
  if (!VALID_PAGES.has(page)) return { success: false, error: "Unknown page." };

  const data = {
    desktopImageId: input.desktopImageId,
    mobileImageId: input.mobileImageId,
    imageAlt: input.imageAlt as Prisma.InputJsonValue,
  };

  await prisma.pageHero.upsert({
    where: { page },
    create: { page, ...data },
    update: data,
  });

  await writeAuditLog({
    action: "update",
    entityType: "page_hero",
    entityId: page,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [
      { field: "desktopImageId", after: input.desktopImageId ?? "(none)" },
      { field: "mobileImageId", after: input.mobileImageId ?? "(none)" },
    ],
  });

  return { success: true, data: { page } };
}
