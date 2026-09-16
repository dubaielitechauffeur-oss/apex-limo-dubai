"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { useToast } from "@/components/admin/ui/Toast";
import { updatePageHeroAction } from "@/app/admin/(dashboard)/page-heroes/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { PageHeroItem } from "@/lib/cms/page-heroes";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

/**
 * One card per page, each its own form — saving the services banner should
 * not touch the locations one, and a failure on either leaves the other's
 * unsaved edits alone.
 */
export function PageHeroManager({
  hero,
  mediaLibraryItems,
}: {
  hero: PageHeroItem;
  mediaLibraryItems: MediaPickerResult[];
}) {
  const [state, formAction, isPending] = useActionState(updatePageHeroAction, initialState);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const desktop = hero.desktopImageId
    ? (mediaLibraryItems.find((m) => m.id === hero.desktopImageId) ?? null)
    : null;
  const mobile = hero.mobileImageId
    ? (mediaLibraryItems.find((m) => m.id === hero.mobileImageId) ?? null)
    : null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{hero.label}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{hero.description}</p>
        </div>
        <a
          href={hero.publicPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
        >
          View page
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="page" value={hero.page} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MediaPickerField
            name="desktopImageId"
            label="Hero image (desktop)"
            initial={desktop}
            initialItems={mediaLibraryItems}
          />
          <MediaPickerField
            name="mobileImageId"
            label="Hero image (mobile)"
            initial={mobile}
            initialItems={mediaLibraryItems}
          />
        </div>

        <LocalizedField
          prefix="imageAlt"
          label="Image description (alt text)"
          value={hero.imageAlt}
          hint="Describes the image for screen readers and search engines. Leave blank to keep the built-in description."
        />

        <p className="text-xs text-gray-500">
          Leave either image blank and that breakpoint keeps the site&apos;s built-in banner, so the page
          never renders without one.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
