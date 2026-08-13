import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getService } from "@/lib/cms/services";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { setServiceStatusAction, deleteServiceAction, restoreServiceAction } from "@/app/admin/(dashboard)/services/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { ServiceForm } from "@/components/admin/cms/ServiceForm";
import { PublishActions } from "@/components/admin/cms/PublishActions";

export const metadata: Metadata = { title: "Edit Service — Admin" };

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.SERVICES_READ);
  const { id } = await params;

  const [result, initialMediaLibraryItems] = await Promise.all([getService(id), getInitialMediaPickerItems()]);

  if (!result.success) {
    if (result.error === "Service not found.") notFound();
    return (
      <div>
        <PageHeader title="Service" breadcrumbs={[{ label: "Services", href: "/admin/services" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const service = result.data;
  // Guarantee this service's own image + OG image resolve in the picker
  // even when they were uploaded earlier than the library's most-recent 24.
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, [service.imageId, service.seo.ogImageId]);
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.SERVICES_UPDATE);
  const canPublish = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.SERVICES_PUBLISH);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.SERVICES_DELETE);

  return (
    <div>
      <PageHeader title={service.name.en || service.slug} breadcrumbs={[{ label: "Services", href: "/admin/services" }, { label: service.name.en || service.slug }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {canManage ? (
            <ServiceForm service={service} mediaLibraryItems={mediaLibraryItems} />
          ) : (
            <ErrorState title="Read-only" description="You do not have permission to edit services." />
          )}
        </div>

        {canPublish || canDelete ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-4">
                <PublishActions
                  status={service.status}
                  listHref="/admin/services"
                  onSetStatus={setServiceStatusAction.bind(null, id)}
                  onDelete={deleteServiceAction.bind(null, id)}
                  onRestore={restoreServiceAction.bind(null, id)}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
