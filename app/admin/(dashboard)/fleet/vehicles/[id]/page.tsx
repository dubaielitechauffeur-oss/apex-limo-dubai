import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getVehicle, listVehicleCategories } from "@/lib/cms/fleet";
import { listFaqsForVehicle } from "@/lib/cms/faq";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { setVehicleStatusAction, deleteVehicleAction, restoreVehicleAction } from "@/app/admin/(dashboard)/fleet/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { VehicleForm } from "@/components/admin/cms/VehicleForm";
import { VehicleFaqsManager } from "@/components/admin/cms/VehicleFaqsManager";
import { PublishActions } from "@/components/admin/cms/PublishActions";

export const metadata: Metadata = { title: "Edit Vehicle — Admin" };

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.FLEET_READ);
  const { id } = await params;

  const [result, categoriesResult, initialMediaLibraryItems, faqsResult] = await Promise.all([
    getVehicle(id),
    listVehicleCategories(),
    getInitialMediaPickerItems(),
    listFaqsForVehicle(id),
  ]);

  if (!result.success) {
    if (result.error === "Vehicle not found.") notFound();
    return (
      <div>
        <PageHeader title="Vehicle" breadcrumbs={[{ label: "Vehicles", href: "/admin/fleet/vehicles" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const vehicle = result.data;
  const categories = categoriesResult.success ? categoriesResult.data : [];
  // The default grid only holds the library's most-recently-uploaded page —
  // guarantee this vehicle's own gallery images and OG image resolve even
  // when they were uploaded earlier than that window (see
  // ensureMediaPickerItems), otherwise an unedited "Save" would silently
  // drop real image references.
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, [
    ...vehicle.images.map((img) => img.mediaId),
    vehicle.seo.ogImageId,
  ]);
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.FLEET_UPDATE);
  const canPublish = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.FLEET_PUBLISH);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.FLEET_DELETE);
  const label = `${vehicle.brand} ${vehicle.model}`.trim() || vehicle.slug;

  return (
    <div>
      <PageHeader title={label} breadcrumbs={[{ label: "Vehicles", href: "/admin/fleet/vehicles" }, { label }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {canManage ? (
            <VehicleForm vehicle={vehicle} categories={categories} mediaLibraryItems={mediaLibraryItems} />
          ) : (
            <ErrorState title="Read-only" description="You do not have permission to edit vehicles." />
          )}
          <VehicleFaqsManager
            vehicleId={vehicle.id}
            faqs={faqsResult.success ? faqsResult.data : []}
            canEdit={canManage}
            canDelete={canDelete}
          />
        </div>

        {canPublish || canDelete ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-4">
                <PublishActions
                  status={vehicle.status}
                  listHref="/admin/fleet/vehicles"
                  onSetStatus={setVehicleStatusAction.bind(null, id)}
                  onDelete={deleteVehicleAction.bind(null, id)}
                  onRestore={restoreVehicleAction.bind(null, id)}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
