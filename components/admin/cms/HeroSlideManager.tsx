"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { PublishStatusSelect, PublishStatusBadge } from "@/components/admin/cms/PublishStatusControls";
import { useToast } from "@/components/admin/ui/Toast";
import { createHeroSlideAction, updateHeroSlideAction, setHeroSlideStatusAction, deleteHeroSlideAction } from "@/app/admin/(dashboard)/homepage/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { HeroSlideItem } from "@/lib/cms/homepage";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";
import { emptyLocalizedText } from "@/lib/cms/localized";

const initialState: CmsActionState = {};

export function HeroSlideManager({ slides, mediaLibraryItems }: { slides: HeroSlideItem[]; mediaLibraryItems: MediaPickerResult[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlideItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Hero Slides</h2>
        <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New slide
        </button>
      </div>

      <ul className="mt-4 divide-y divide-gray-100">
        {slides.length === 0 ? <p className="py-4 text-sm text-gray-400">No hero slides yet.</p> : null}
        {slides.map((slide) => (
          <li key={slide.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{slide.title.en || "Untitled"}</p>
              <div className="mt-1"><PublishStatusBadge status={slide.status} /></div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const result = await setHeroSlideStatusAction(slide.id, slide.status === "published" ? "draft" : "published");
                  if (!result.success) showToast(result.error ?? "Something went wrong.", "error");
                  else {
                    showToast(result.success ?? "Updated.", "success");
                    router.refresh();
                  }
                }}
                aria-label={slide.status === "published" ? "Unpublish" : "Publish"}
                className="text-gray-400 hover:text-gray-700"
              >
                {slide.status === "published" ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => setEditing(slide)} aria-label="Edit" className="text-gray-400 hover:text-gray-700">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <ConfirmDialog
                trigger={(open) => (
                  <button type="button" onClick={open} aria-label="Delete" className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                title="Delete this hero slide?"
                description="This permanently removes the slide. This cannot be undone."
                confirmLabel="Delete"
                tone="danger"
                onConfirm={async () => {
                  const result = await deleteHeroSlideAction(slide.id);
                  if (!result.success) showToast(result.error ?? "Could not delete.", "error");
                  else {
                    showToast(result.success ?? "Deleted.", "success");
                    router.refresh();
                  }
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <HeroSlideFormModal open={createOpen} onClose={() => setCreateOpen(false)} slide={null} mediaLibraryItems={mediaLibraryItems} />
      {editing ? <HeroSlideFormModal open onClose={() => setEditing(null)} slide={editing} mediaLibraryItems={mediaLibraryItems} /> : null}
    </section>
  );
}

function HeroSlideFormModal({ open, onClose, slide, mediaLibraryItems }: { open: boolean; onClose: () => void; slide: HeroSlideItem | null; mediaLibraryItems: MediaPickerResult[] }) {
  const action = slide ? updateHeroSlideAction : createHeroSlideAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      router.refresh();
      onClose();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const desktopImage = slide?.desktopImageId ? (mediaLibraryItems.find((m) => m.id === slide.desktopImageId) ?? null) : null;
  const mobileImage = slide?.mobileImageId ? (mediaLibraryItems.find((m) => m.id === slide.mobileImageId) ?? null) : null;

  return (
    <Modal open={open} onClose={onClose} title={slide ? "Edit hero slide" : "New hero slide"}>
      <form action={formAction} className="space-y-4">
        {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
        <LocalizedField prefix="title" label="Title" value={slide?.title} required />
        <LocalizedField prefix="subtitle" label="Subtitle" value={slide?.subtitle ?? emptyLocalizedText()} />

        <div className="grid grid-cols-2 gap-3">
          <MediaPickerField name="desktopImageId" label="Desktop image" initial={desktopImage} initialItems={mediaLibraryItems} />
          <MediaPickerField name="mobileImageId" label="Mobile image" initial={mobileImage} initialItems={mediaLibraryItems} />
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Call to action buttons</span>
          {[0, 1].map((index) => (
            <div key={index} className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-gray-100 p-2">
              <FormField id={`cta_${index}_label_en`} label={`CTA ${index + 1} label`}>
                <input id={`cta_${index}_label_en`} name={`cta_${index}_label_en`} defaultValue={slide?.ctas[index]?.label.en} className={ADMIN_INPUT_CLASSES} />
              </FormField>
              <FormField id={`cta_${index}_href`} label="Link">
                <input id={`cta_${index}_href`} name={`cta_${index}_href`} defaultValue={slide?.ctas[index]?.href} className={ADMIN_INPUT_CLASSES} />
              </FormField>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PublishStatusSelect defaultValue={slide?.status ?? "draft"} />
          <FormField id="sortOrder" label="Sort order">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={slide?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : slide ? "Save changes" : "Create slide"}
        </button>
      </form>
    </Modal>
  );
}
