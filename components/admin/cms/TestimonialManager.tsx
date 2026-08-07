"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { createTestimonialAction, updateTestimonialAction, deleteTestimonialAction } from "@/app/admin/(dashboard)/homepage/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { TestimonialItem } from "@/lib/cms/homepage";

const initialState: CmsActionState = {};

export function TestimonialManager({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Testimonials</h2>
        <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New testimonial
        </button>
      </div>

      <ul className="mt-4 divide-y divide-gray-100">
        {testimonials.length === 0 ? <p className="py-4 text-sm text-gray-400">No testimonials yet.</p> : null}
        {testimonials.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{item.name} {item.isFeatured ? <span className="ml-1 text-xs text-amber-600">★ Featured</span> : null}</p>
              <p className="mt-0.5 flex items-center gap-0.5 text-xs text-gray-400">
                {Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setEditing(item)} aria-label="Edit" className="text-gray-400 hover:text-gray-700">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <ConfirmDialog
                trigger={(open) => (
                  <button type="button" onClick={open} aria-label="Delete" className="text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                title="Delete this testimonial?"
                description="This permanently removes the testimonial. This cannot be undone."
                confirmLabel="Delete"
                tone="danger"
                onConfirm={async () => {
                  const result = await deleteTestimonialAction(item.id);
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

      <TestimonialFormModal open={createOpen} onClose={() => setCreateOpen(false)} testimonial={null} />
      {editing ? <TestimonialFormModal open onClose={() => setEditing(null)} testimonial={editing} /> : null}
    </section>
  );
}

function TestimonialFormModal({ open, onClose, testimonial }: { open: boolean; onClose: () => void; testimonial: TestimonialItem | null }) {
  const action = testimonial ? updateTestimonialAction : createTestimonialAction;
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

  return (
    <Modal open={open} onClose={onClose} title={testimonial ? "Edit testimonial" : "New testimonial"}>
      <form action={formAction} className="space-y-4">
        {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}
        <div className="grid grid-cols-2 gap-3">
          <FormField id="name" label="Name" required>
            <input id="name" name="name" required defaultValue={testimonial?.name} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="avatarInitials" label="Avatar initials" required>
            <input id="avatarInitials" name="avatarInitials" required maxLength={3} defaultValue={testimonial?.avatarInitials} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
        <FormField id="text" label="Testimonial text" required>
          <textarea id="text" name="text" required rows={3} defaultValue={testimonial?.text} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField id="rating" label="Rating (1-5)">
            <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="serviceUsed" label="Service used">
            <input id="serviceUsed" name="serviceUsed" defaultValue={testimonial?.serviceUsed} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="location" label="Location">
            <input id="location" name="location" defaultValue={testimonial?.location} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="date" label="Date" hint='E.g. "March 2026".'>
            <input id="date" name="date" defaultValue={testimonial?.date} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="source" label="Source">
            <input id="source" name="source" defaultValue={testimonial?.source ?? "direct"} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
        <FormField id="profileUrl" label="Profile URL" hint="Optional — link to the reviewer's Google/social profile.">
          <input id="profileUrl" name="profileUrl" defaultValue={testimonial?.profileUrl ?? ""} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="sortOrder" label="Sort order">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={testimonial?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
            <input type="checkbox" name="isFeatured" defaultChecked={testimonial?.isFeatured} className="h-4 w-4 rounded border-gray-300" />
            Featured
          </label>
        </div>
        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : testimonial ? "Save changes" : "Create testimonial"}
        </button>
      </form>
    </Modal>
  );
}
