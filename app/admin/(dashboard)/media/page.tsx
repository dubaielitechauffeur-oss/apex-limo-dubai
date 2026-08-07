import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listMedia, type ListMediaParams } from "@/lib/media/items";
import { listFolders } from "@/lib/media/folders";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchInput } from "@/components/admin/ui/SearchInput";
import { FilterDropdown } from "@/components/admin/ui/FilterDropdown";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { FolderPanel } from "@/components/admin/media/FolderPanel";
import { UploadMediaModal } from "@/components/admin/media/UploadMediaModal";

export const metadata: Metadata = { title: "Media Library — Admin" };

interface MediaPageProps {
  searchParams: Promise<{
    q?: string;
    folder?: string;
    type?: string;
    variant?: string;
    provider?: string;
    page?: string;
  }>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/admin/media?${query}` : "/admin/media";
}

export default async function MediaLibraryPage({ searchParams }: MediaPageProps) {
  await requirePermission(PERMISSIONS.MEDIA_READ);

  const params = await searchParams;
  const listParams: ListMediaParams = {
    q: params.q,
    folderId: params.folder,
    type: params.type as ListMediaParams["type"],
    variant: params.variant as ListMediaParams["variant"],
    storageProvider: params.provider as ListMediaParams["storageProvider"],
    page: params.page ? Number(params.page) : 1,
  };

  const [mediaResult, foldersResult] = await Promise.all([listMedia(listParams), listFolders()]);

  if (!mediaResult.success) {
    return (
      <div>
        <PageHeader title="Media Library" />
        <ErrorState description={mediaResult.error} />
      </div>
    );
  }

  const folders = foldersResult.success ? foldersResult.data : [];
  const activeFolderId = params.folder === "root" ? null : (params.folder ?? null);
  const { items, total, page, pageSize, totalPages } = mediaResult.data;

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle={`${total} file${total === 1 ? "" : "s"}.`}
        actions={<UploadMediaModal folders={folders} currentFolderId={params.folder === "root" ? null : (params.folder ?? null)} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <FolderPanel folders={folders} activeFolderId={activeFolderId} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchInput placeholder="Search filename or alt text…" />
            <FilterDropdown
              paramName="type"
              label="Filter by type"
              options={[{ label: "Image", value: "image" }, { label: "Video", value: "video" }, { label: "Document", value: "document" }]}
              allLabel="All types"
            />
            <FilterDropdown
              paramName="variant"
              label="Filter by variant"
              options={["original", "desktop", "mobile", "thumbnail", "og"].map((v) => ({ label: v, value: v }))}
              allLabel="All variants"
            />
            <FilterDropdown
              paramName="provider"
              label="Filter by storage"
              options={[{ label: "Local", value: "local" }, { label: "S3", value: "s3" }, { label: "R2", value: "r2" }]}
              allLabel="All storage"
            />
          </div>

          <MediaGrid items={items} />

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            buildHref={(nextPage) =>
              buildHref({ q: params.q, folder: params.folder, type: params.type, variant: params.variant, provider: params.provider }, nextPage)
            }
          />
        </div>
      </div>
    </div>
  );
}
