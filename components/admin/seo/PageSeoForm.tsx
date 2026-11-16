"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePageSeoAction, type CmsActionState } from "@/app/admin/(dashboard)/seo/actions";
import { SeoFieldsSection, type SeoFieldDefaults } from "@/components/admin/cms/SeoFieldsSection";
import { useToast } from "@/components/admin/ui/Toast";
import type { SeoMeta } from "@/lib/cms/seo";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";
import type { PageSeoEntry } from "@/lib/seo-pages/catalog";

const initialState: CmsActionState = {};

export function PageSeoForm({
  entry,
  seo,
  defaults,
  mediaLibraryItems,
}: {
  entry: PageSeoEntry;
  seo: SeoMeta;
  defaults: SeoFieldDefaults;
  mediaLibraryItems: MediaPickerResult[];
}) {
  const [state, formAction, isPending] = useActionState(updatePageSeoAction, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const ogImage = seo.ogImageId ? (mediaLibraryItems.find((m) => m.id === seo.ogImageId) ?? null) : null;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="page" value={entry.page} />

      <SeoFieldsSection
        seo={seo}
        ogImage={ogImage}
        mediaLibraryItems={mediaLibraryItems}
        showMeta={entry.meta !== null}
        showH1={entry.h1 !== null}
        headingSlots={entry.headings}
        defaults={defaults}
      />

      <div className="sticky bottom-0 -mx-1 flex items-center gap-4 border-t border-gray-200 bg-gray-50/95 px-1 py-3 backdrop-blur">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <span className="text-xs text-gray-500">Blank fields keep the built-in text.</span>
      </div>
    </form>
  );
}
