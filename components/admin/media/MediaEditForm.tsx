"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMediaMetadataAction, type MediaActionState } from "@/app/admin/(dashboard)/media/actions";
import { FormField, SelectField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { routing } from "@/i18n/routing";
import type { MediaFolderNode } from "@/lib/media/folders";
import type { LocalizedText } from "@/lib/media/items";

const VARIANT_OPTIONS = ["original", "desktop", "mobile", "thumbnail", "og"] as const;

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  zh: "Chinese",
  fr: "French",
  de: "German",
};

const initialState: MediaActionState = {};

export function MediaEditForm({
  mediaId,
  alt,
  caption,
  folderId,
  variant,
  folders,
}: {
  mediaId: string;
  alt: LocalizedText;
  caption: LocalizedText | null;
  folderId: string | null;
  variant: string | null;
  folders: MediaFolderNode[];
}) {
  const [state, formAction, isPending] = useActionState(updateMediaMetadataAction, initialState);
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

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={mediaId} />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Alt text</h3>
        <p className="mt-1 text-xs text-gray-500">
          Shown to screen readers and search engines on the public site, per language.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {routing.locales.map((locale) => (
            <FormField key={locale} id={`alt_${locale}`} label={LOCALE_LABELS[locale] ?? locale}>
              <input id={`alt_${locale}`} name={`alt_${locale}`} defaultValue={alt[locale] ?? ""} className={ADMIN_INPUT_CLASSES} />
            </FormField>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Caption</h3>
        <p className="mt-1 text-xs text-gray-500">Optional — displayed alongside the image where the CMS supports it.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {routing.locales.map((locale) => (
            <FormField key={locale} id={`caption_${locale}`} label={LOCALE_LABELS[locale] ?? locale}>
              <input
                id={`caption_${locale}`}
                name={`caption_${locale}`}
                defaultValue={caption?.[locale] ?? ""}
                className={ADMIN_INPUT_CLASSES}
              />
            </FormField>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="folderId" label="Folder">
          <SelectField id="folderId" defaultValue={folderId ?? ""}>
            <option value="">— Root —</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </SelectField>
        </FormField>

        <FormField id="variant" label="Variant">
          <SelectField id="variant" defaultValue={variant ?? ""}>
            <option value="">— Not tagged —</option>
            {VARIANT_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SelectField>
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
