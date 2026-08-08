"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateDefaultSeoAction, type CmsActionState } from "@/app/admin/(dashboard)/seo/actions";
import { SeoFieldsSection } from "@/components/admin/cms/SeoFieldsSection";
import { useToast } from "@/components/admin/ui/Toast";
import type { SeoMeta } from "@/lib/cms/seo";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function DefaultSeoForm({ seo, mediaLibraryItems }: { seo: SeoMeta; mediaLibraryItems: MediaPickerResult[] }) {
  const [state, formAction, isPending] = useActionState(updateDefaultSeoAction, initialState);
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
      <p className="text-sm text-gray-500">
        Used as the site-wide fallback title, description, and social share image — every page that sets its
        own SEO fields (Fleet, Services, Locations, Blog…) still takes priority; this only fills in when a
        page has none of its own, plus the shared browser-tab title suffix and default robots directive.
      </p>

      <SeoFieldsSection seo={seo} ogImage={ogImage} mediaLibraryItems={mediaLibraryItems} />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
