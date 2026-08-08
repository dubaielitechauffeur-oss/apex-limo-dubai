import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit/log";
import { getAuthzContext, hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { logUnauthorizedAccess } from "@/lib/permissions/audit";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { requireCmsPermission } from "@/lib/cms/guard";
import { seoMetaSchema, type SeoMeta } from "@/lib/cms/seo";
import type { RoleAdminResult } from "@/lib/permissions/roles-admin";
import type { GlobalSettings, Prisma } from "@/lib/generated/prisma/client";

/** `GlobalSettings` is a single-row table (Phase 2B) and — per
 *  prisma/seed.ts — is never seeded, so `null` here is the normal state
 *  until an admin saves the settings form for the first time (see
 *  `updateGlobalSettings` below, which creates the row on first save). */
export async function getGlobalSettings(): Promise<RoleAdminResult<GlobalSettings | null>> {
  const ctx = await getAuthzContext();
  if (!ctx) return { success: false, error: "Not signed in." };
  if (!isSuperAdmin(ctx) && !hasPermission(ctx, PERMISSIONS.SETTINGS_READ)) {
    await logUnauthorizedAccess(ctx, PERMISSIONS.SETTINGS_READ, "missing_permission");
    return { success: false, error: "You do not have permission to view settings." };
  }

  const settings = await prisma.globalSettings.findFirst();
  return { success: true, data: settings };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,16}$/;

export interface GlobalSettingsInput {
  companyName: string;
  shortName: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  notificationEmail: string;
  defaultCurrency: string;
  timezone: string;
  fleetSizeDisplay: string;
  ratingDisplay: string;
}

function validateGlobalSettingsInput(input: GlobalSettingsInput): string | null {
  if (!input.companyName.trim()) return "Company name is required.";
  if (!input.shortName.trim()) return "Short name is required.";
  if (!PHONE_PATTERN.test(input.phone.trim())) return "Phone number is not a valid format.";
  if (!input.phoneDisplay.trim()) return "Phone (display) is required.";
  if (!PHONE_PATTERN.test(input.whatsapp.trim())) return "WhatsApp number is not a valid format.";
  if (!EMAIL_PATTERN.test(input.email.trim())) return "Email is not a valid address.";
  if (!EMAIL_PATTERN.test(input.notificationEmail.trim())) return "Notification email is not a valid address.";
  if (!input.defaultCurrency.trim()) return "Default currency is required.";
  if (!input.timezone.trim()) return "Timezone is required.";
  return null;
}

/**
 * Creates the single `GlobalSettings` row on first save, updates it
 * thereafter. The JSON fields no editor exists for yet (`address`,
 * `socialLinks`, `footer`, `defaultSeo` — see `updateDefaultSeo` below for
 * that last one) default to `{}` on first creation rather than blocking
 * the phone/WhatsApp/email edit this phase's brief actually asked for; the
 * public site has zero readers of those fields today (confirmed by audit),
 * so an empty placeholder is harmless until a future editor exists for
 * them, and existing values are always preserved on every subsequent save
 * since only the fields this form owns are ever written.
 */
export async function updateGlobalSettings(input: GlobalSettingsInput): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.SETTINGS_UPDATE);
  if (!gate.success) return gate;

  const validationError = validateGlobalSettingsInput(input);
  if (validationError) return { success: false, error: validationError };

  const data = {
    companyName: input.companyName.trim(),
    shortName: input.shortName.trim(),
    phone: input.phone.trim(),
    phoneDisplay: input.phoneDisplay.trim(),
    whatsapp: input.whatsapp.trim(),
    email: input.email.trim(),
    notificationEmail: input.notificationEmail.trim(),
    defaultCurrency: input.defaultCurrency.trim(),
    timezone: input.timezone.trim(),
    fleetSizeDisplay: input.fleetSizeDisplay.trim(),
    ratingDisplay: input.ratingDisplay.trim(),
  };

  const existing = await prisma.globalSettings.findFirst();

  if (existing) {
    await prisma.globalSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.globalSettings.create({
      data: { ...data, address: {}, socialLinks: {}, footer: {}, defaultSeo: {} },
    });
  }

  await writeAuditLog({
    action: "settings_change",
    entityType: "global_settings",
    entityId: existing?.id ?? "global",
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: Object.entries(data).map(([field, after]) => ({
      field,
      before: existing ? String((existing as unknown as Record<string, unknown>)[field] ?? "") : undefined,
      after: String(after),
    })),
  });

  return { success: true, data: null };
}

/** Site-wide default SEO metadata — reuses the exact `SeoMeta` shape and
 *  validation every content entity's own `seo` column already uses
 *  (`lib/cms/seo.ts`), so the admin `/admin/seo` page can reuse
 *  `SeoFieldsSection` as-is instead of a parallel form. */
export async function updateDefaultSeo(input: SeoMeta): Promise<RoleAdminResult<null>> {
  const gate = await requireCmsPermission(PERMISSIONS.SEO_UPDATE);
  if (!gate.success) return gate;

  const parsed = seoMetaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid SEO data." };

  const existing = await prisma.globalSettings.findFirst();
  const defaultSeo = parsed.data as unknown as Prisma.InputJsonValue;

  if (existing) {
    await prisma.globalSettings.update({ where: { id: existing.id }, data: { defaultSeo } });
  } else {
    await prisma.globalSettings.create({
      data: {
        companyName: "Apex Limo & Chauffeur Dubai",
        shortName: "Apex Limo",
        phone: "",
        phoneDisplay: "",
        whatsapp: "",
        email: "",
        notificationEmail: "",
        address: {},
        socialLinks: {},
        footer: {},
        defaultSeo,
      },
    });
  }

  await writeAuditLog({
    action: "settings_change",
    entityType: "global_settings",
    entityId: existing?.id ?? "global",
    userId: gate.data.userId,
    userName: gate.data.roleName,
    changes: [{ field: "defaultSeo" }],
  });

  return { success: true, data: null };
}
