import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getLocation } from "@/lib/cms/locations";
import { getInitialMediaPickerItems, ensureMediaPickerItems } from "@/lib/cms/media-picker-actions";
import { setLocationStatusAction, deleteLocationAction, restoreLocationAction } from "@/app/admin/(dashboard)/locations/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { LocationForm } from "@/components/admin/cms/LocationForm";
import { PublishActions } from "@/components/admin/cms/PublishActions";
import { PopularRoutesManager } from "@/components/admin/cms/PopularRoutesManager";

export const metadata: Metadata = { title: "Edit Location — Admin" };

interface LocationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.LOCATIONS_READ);
  const { id } = await params;

  const [result, initialMediaLibraryItems] = await Promise.all([getLocation(id), getInitialMediaPickerItems()]);

  if (!result.success) {
    if (result.error === "Location not found.") notFound();
    return (
      <div>
        <PageHeader title="Location" breadcrumbs={[{ label: "Locations", href: "/admin/locations" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const location = result.data;
  // Resolve hero (desktop+mobile) and OG image references even when they
  // fall outside the picker's most-recent-uploaded page.
  const mediaLibraryItems = await ensureMediaPickerItems(initialMediaLibraryItems, [
    location.heroDesktopImageId,
    location.heroMobileImageId,
    location.seo.ogImageId,
  ]);
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.LOCATIONS_UPDATE);
  const canPublish = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.LOCATIONS_PUBLISH);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.LOCATIONS_DELETE);

  return (
    <div>
      <PageHeader title={location.name} breadcrumbs={[{ label: "Locations", href: "/admin/locations" }, { label: location.name }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {canManage ? <LocationForm location={location} mediaLibraryItems={mediaLibraryItems} /> : <ErrorState title="Read-only" description="You do not have permission to edit locations." />}
          {canManage ? <PopularRoutesManager locationId={location.id} routes={location.popularRoutes} /> : null}
        </div>

        {canPublish || canDelete ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-4">
                <PublishActions
                  status={location.status}
                  listHref="/admin/locations"
                  onSetStatus={setLocationStatusAction.bind(null, id)}
                  onDelete={deleteLocationAction.bind(null, id)}
                  onRestore={restoreLocationAction.bind(null, id)}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
