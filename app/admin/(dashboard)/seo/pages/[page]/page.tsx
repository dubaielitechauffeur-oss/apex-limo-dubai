import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getPageSeoForEdit } from "@/lib/cms/page-seo";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { routing, type Locale } from "@/i18n/routing";
import { loadMessages } from "@/i18n/load-messages";
import { getMessageValue } from "@/lib/seo-pages/messages";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { PageSeoForm } from "@/components/admin/seo/PageSeoForm";
import type { SeoFieldDefaults } from "@/components/admin/cms/SeoFieldsSection";
import type { PageSeoEntry } from "@/lib/seo-pages/catalog";

export const metadata: Metadata = { title: "Page SEO — Admin" };

interface PageSeoEditPageProps {
  params: Promise<{ page: string }>;
}

/**
 * The built-in text of every field on this page, per locale — shown as the
 * grey placeholder so a blank field visibly means "keep this". Read from the
 * raw message files, not from the live (already-overridden) messages, so the
 * placeholder is always the original and never an earlier edit.
 */
async function loadDefaults(entry: PageSeoEntry): Promise<SeoFieldDefaults> {
  const defaults: Required<SeoFieldDefaults> = { title: {}, description: {}, h1: {}, headings: {} };
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => [locale, await loadMessages(locale)] as const)
  );

  for (const [locale, messages] of perLocale) {
    const read = (key: string) => getMessageValue(messages, key);
    const set = (target: Partial<Record<Locale, string>>, value: string | undefined) => {
      if (value) target[locale] = value;
    };
    if (entry.meta) {
      set(defaults.title, read(entry.meta.titleKey));
      set(defaults.description, read(entry.meta.descriptionKey));
    }
    if (entry.h1) set(defaults.h1, read(entry.h1.messageKey));
    for (const slot of entry.headings) {
      defaults.headings[slot.key] ??= {};
      set(defaults.headings[slot.key], read(slot.messageKey));
    }
  }
  return defaults;
}

export default async function PageSeoEditPage({ params }: PageSeoEditPageProps) {
  const ctx = await requirePermission(PERMISSIONS.SEO_READ);
  const { page } = await params;

  const [result, initialMediaLibraryItems] = await Promise.all([getPageSeoForEdit(page), getInitialMediaPickerItems()]);

  if (!result.success) {
    if (result.error === "Page not found.") notFound();
    return (
      <div>
        <PageHeader title="Page SEO" breadcrumbs={[{ label: "SEO Manager", href: "/admin/seo" }, { label: "Page" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const { entry, seo } = result.data;
  const [defaults, mediaLibraryItems] = await Promise.all([
    loadDefaults(entry),
    ensureMediaPickerItems(initialMediaLibraryItems, [seo.ogImageId]),
  ]);
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.SEO_UPDATE);

  return (
    <div>
      <PageHeader
        title={entry.label}
        subtitle={entry.description}
        breadcrumbs={[{ label: "SEO Manager", href: "/admin/seo" }, { label: entry.label }]}
        actions={
          entry.publicPath ? (
            <a
              href={entry.publicPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null
        }
      />

      <div className="max-w-4xl">
        {canManage ? (
          <PageSeoForm entry={entry} seo={seo} defaults={defaults} mediaLibraryItems={mediaLibraryItems} />
        ) : (
          <ErrorState title="Read-only" description="You do not have permission to edit SEO settings." />
        )}
      </div>
    </div>
  );
}
