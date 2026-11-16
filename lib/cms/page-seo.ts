import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { Prisma } from "@/lib/generated/prisma/client";
import { routing } from "@/i18n/routing";
import { requireCmsPermission } from "./guard";
import { emptySeoMeta, seoMetaSchema, type SeoMeta } from "./seo";
import { emptyLocalizedText, type LocalizedText } from "./localized";
import { PAGE_SEO_CATALOG, getPageSeoEntry, type PageSeoEntry } from "@/lib/seo-pages/catalog";

/**
 * Admin side of "Page SEO": meta tags, H1 and section headings for public
 * pages that are not a CMS record (see `lib/seo-pages/catalog.ts`).
 *
 * One `PageSeo` row per catalog entry, created on first save. A page with no
 * row is listed as "Default" and renders its built-in copy. Rides on the
 * existing `seo:read` / `seo:update` permissions — the same ones the
 * site-wide Default SEO form uses — so every role that can already manage
 * SEO can use this without a re-seed.
 */

export interface PageSeoListItem {
  entry: PageSeoEntry;
  /** How many fields (meta, H1, headings — English) have a saved value. */
  customisedCount: number;
  updatedAt: Date | null;
}

function countCustomised(seo: SeoMeta): number {
  const en = routing.defaultLocale;
  let count = 0;
  if (seo.title?.[en]?.trim()) count++;
  if (seo.description?.[en]?.trim()) count++;
  if (seo.h1?.[en]?.trim()) count++;
  for (const value of Object.values(seo.headings ?? {})) {
    if (Object.values(value ?? {}).some((text) => text?.trim())) count++;
  }
  if (seo.canonical) count++;
  if (seo.ogImageId) count++;
  if (seo.noIndex) count++;
  if (seo.noFollow) count++;
  return count;
}

export async function listPageSeo(): Promise<RoleAdminResult<PageSeoListItem[]>> {
  const gate = await requireCmsPermission(PERMISSIONS.SEO_READ);
  if (!gate.success) return gate;

  const rows = await prisma.pageSeo.findMany();
  const byPage = new Map(rows.map((row) => [row.page, row]));

  return {
    success: true,
    data: PAGE_SEO_CATALOG.map((entry) => {
      const row = byPage.get(entry.page);
      const seo = (row?.seo as unknown as SeoMeta | null) ?? null;
      return {
        entry,
        customisedCount: seo ? countCustomised(seo) : 0,
        updatedAt: row?.updatedAt ?? null,
      };
    }),
  };
}

export async function getPageSeoForEdit(page: string): Promise<RoleAdminResult<{ entry: PageSeoEntry; seo: SeoMeta }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SEO_READ);
  if (!gate.success) return gate;

  const entry = getPageSeoEntry(page);
  if (!entry) return { success: false, error: "Page not found." };

  const row = await prisma.pageSeo.findUnique({ where: { page } });
  const stored = (row?.seo as unknown as SeoMeta | null) ?? null;
  return { success: true, data: { entry, seo: { ...emptySeoMeta(), ...(stored ?? {}) } } };
}

const MAX_HEADING_LENGTH = 200;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;

function clampLocalized(value: LocalizedText | undefined, max: number): LocalizedText {
  const out = emptyLocalizedText();
  for (const locale of routing.locales) out[locale] = (value?.[locale] ?? "").trim().slice(0, max);
  return out;
}

export async function updatePageSeo(page: string, input: SeoMeta): Promise<RoleAdminResult<{ page: string }>> {
  const gate = await requireCmsPermission(PERMISSIONS.SEO_UPDATE);
  if (!gate.success) return gate;

  // The slug comes from the URL/form, so it is checked against the catalog
  // rather than trusted — an arbitrary value would create a row nothing reads.
  const entry = getPageSeoEntry(page);
  if (!entry) return { success: false, error: "Unknown page." };

  const parsed = seoMetaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid SEO data." };

  if (parsed.data.canonical && !/^https?:\/\//i.test(parsed.data.canonical)) {
    return { success: false, error: "Canonical URL must start with https://" };
  }

  // Only the heading slots this page declares are stored. This is what stops
  // a crafted form post from writing an override for an unrelated message.
  const allowed = new Set(entry.headings.map((slot) => slot.key));
  const headings: Record<string, LocalizedText> = {};
  for (const [key, value] of Object.entries(parsed.data.headings ?? {})) {
    if (!allowed.has(key)) continue;
    const clamped = clampLocalized(value as LocalizedText, MAX_HEADING_LENGTH);
    if (Object.values(clamped).some(Boolean)) headings[key] = clamped;
  }

  const hasMeta = entry.meta !== null;
  const seo: SeoMeta = {
    title: hasMeta ? clampLocalized(parsed.data.title as LocalizedText, MAX_TITLE_LENGTH) : emptyLocalizedText(),
    description: hasMeta
      ? clampLocalized(parsed.data.description as LocalizedText, MAX_DESCRIPTION_LENGTH)
      : emptyLocalizedText(),
    ogImageId: hasMeta ? parsed.data.ogImageId : null,
    canonical: hasMeta ? parsed.data.canonical : null,
    noIndex: hasMeta ? parsed.data.noIndex : false,
    noFollow: hasMeta ? parsed.data.noFollow : false,
    h1: entry.h1 ? clampLocalized(parsed.data.h1 as LocalizedText | undefined, MAX_HEADING_LENGTH) : emptyLocalizedText(),
    headings,
  };

  const data = { seo: seo as unknown as Prisma.InputJsonValue };
  await prisma.pageSeo.upsert({ where: { page }, create: { page, ...data }, update: data });

  await writeAuditLog({
    action: "update",
    entityType: "page_seo",
    entityId: page,
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [
      { field: "title", after: seo.title[routing.defaultLocale] || "(default)" },
      { field: "description", after: seo.description[routing.defaultLocale] || "(default)" },
      { field: "h1", after: seo.h1?.[routing.defaultLocale] || "(default)" },
      { field: "headings", after: `${Object.keys(headings).length} customised` },
    ],
  });

  return { success: true, data: { page } };
}
