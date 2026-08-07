import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getMediaItem, findMediaUsage } from "@/lib/media/items";
import { listFolders } from "@/lib/media/folders";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { MediaEditForm } from "@/components/admin/media/MediaEditForm";
import { MediaDeleteSection } from "@/components/admin/media/MediaDeleteSection";
import { formatAdminDateTime, formatFileSize } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Media Details — Admin" };

interface MediaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.MEDIA_READ);
  const { id } = await params;

  const result = await getMediaItem(id);
  if (!result.success) {
    if (result.error === "Media item not found.") notFound();
    return (
      <div>
        <PageHeader title="Media Details" breadcrumbs={[{ label: "Media Library", href: "/admin/media" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const media = result.data;
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.MEDIA_UPDATE);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.MEDIA_DELETE);

  const [foldersResult, usage] = await Promise.all([listFolders(), canDelete ? findMediaUsage(id) : Promise.resolve([])]);
  const folders = foldersResult.success ? foldersResult.data : [];

  return (
    <div>
      <PageHeader
        title={media.originalFilename}
        breadcrumbs={[{ label: "Media Library", href: "/admin/media" }, { label: media.originalFilename }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="relative aspect-video overflow-hidden rounded-md bg-gray-100">
              <Image src={media.url} alt={media.alt.en || media.originalFilename} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
            </div>
          </section>

          {canManage ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Edit Details</h2>
              <div className="mt-4">
                <MediaEditForm
                  mediaId={media.id}
                  alt={media.alt}
                  caption={media.caption}
                  folderId={media.folderId}
                  variant={media.variant}
                  folders={folders}
                />
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Technical Details</h2>
            <dl className="mt-4 space-y-3">
              <InfoField label="Filename" value={media.filename} mono />
              <InfoField label="MIME type" value={media.mimeType} mono />
              <InfoField label="File size" value={formatFileSize(media.sizeBytes)} />
              <InfoField label="Dimensions" value={media.width && media.height ? `${media.width} × ${media.height}px` : "Unknown"} />
              <InfoField label="Storage provider" value={<StatusBadge label={media.storageProvider} tone="info" />} />
              <InfoField label="Storage path" value={media.storagePath} mono />
              <InfoField label="Folder" value={media.folderName ?? "Root"} />
              <InfoField label="Uploaded by" value={media.uploadedByName ?? "Unknown"} />
              <InfoField label="Created" value={formatAdminDateTime(media.createdAt)} />
              <InfoField label="Updated" value={formatAdminDateTime(media.updatedAt)} />
            </dl>
          </section>

          {canDelete ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Danger Zone</h2>
              <p className="mt-1 text-xs text-gray-500">
                {usage.length > 0 ? `Currently used in ${usage.length} place(s).` : "Not currently used anywhere."}
              </p>
              <div className="mt-4">
                <MediaDeleteSection mediaId={media.id} usage={usage} />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-0.5 break-all text-sm text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
