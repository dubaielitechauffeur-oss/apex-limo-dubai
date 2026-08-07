"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { useToast } from "@/components/admin/ui/Toast";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
  deleteBlogCategoryAction,
  createTagAction,
  deleteTagAction,
} from "@/app/admin/(dashboard)/blog/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import type { BlogCategoryItem, TagItem } from "@/lib/cms/blog";
import { emptyLocalizedText } from "@/lib/cms/localized";

const initialState: CmsActionState = {};

export function BlogTaxonomyManager({ categories, tags }: { categories: BlogCategoryItem[]; tags: TagItem[] }) {
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<BlogCategoryItem | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const tagFormRef = useRef<HTMLFormElement>(null);

  async function handleAddTag(formData: FormData) {
    const result = await createTagAction(String(formData.get("name") ?? ""));
    if (!result.success) showToast(result.error ?? "Could not create tag.", "error");
    else {
      tagFormRef.current?.reset();
      showToast(result.success ?? "Tag created.", "success");
      router.refresh();
    }
  }

  async function handleDeleteTag(id: string) {
    const result = await deleteTagAction(id);
    if (!result.success) showToast(result.error ?? "Could not delete tag.", "error");
    else {
      showToast(result.success ?? "Deleted.", "success");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Categories</h2>
          <button type="button" onClick={() => setCreateCatOpen(true)} aria-label="New category" className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {categories.map((cat) => (
            <li key={cat.id} className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
              <span className="truncate text-gray-700">{cat.name.en || cat.slug} <span className="text-xs text-gray-400">({cat.postCount})</span></span>
              <span className="hidden items-center gap-1 group-hover:flex">
                <button type="button" onClick={() => setEditingCat(cat)} aria-label={`Edit ${cat.slug}`} className="text-gray-400 hover:text-gray-700">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <ConfirmDialog
                  trigger={(open) => (
                    <button type="button" onClick={open} aria-label={`Delete ${cat.slug}`} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  title={`Delete "${cat.name.en || cat.slug}"?`}
                  description={cat.postCount > 0 ? `${cat.postCount} post(s) use this category — they'll become uncategorized.` : "This category isn't used by any post."}
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={async () => {
                    const result = await deleteBlogCategoryAction(cat.id);
                    if (!result.success) showToast(result.error ?? "Could not delete.", "error");
                    else {
                      showToast(result.success ?? "Deleted.", "success");
                      router.refresh();
                    }
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag.id} className="group inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {tag.name}
              <button type="button" onClick={() => handleDeleteTag(tag.id)} aria-label={`Remove ${tag.name}`} className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <form ref={tagFormRef} action={handleAddTag} className="mt-3 flex gap-2">
          <input name="name" placeholder="New tag…" className={`${ADMIN_INPUT_CLASSES} text-xs`} />
          <button type="submit" className="shrink-0 rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">Add</button>
        </form>
      </div>

      <CategoryModal open={createCatOpen} onClose={() => setCreateCatOpen(false)} category={null} />
      {editingCat ? <CategoryModal open onClose={() => setEditingCat(null)} category={editingCat} /> : null}
    </div>
  );
}

function CategoryModal({ open, onClose, category }: { open: boolean; onClose: () => void; category: BlogCategoryItem | null }) {
  const action = category ? updateBlogCategoryAction : createBlogCategoryAction;
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
    <Modal open={open} onClose={onClose} title={category ? "Edit category" : "New category"}>
      <form action={formAction} className="space-y-4">
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <FormField id="slug" label="Slug" required>
          <input id="slug" name="slug" required defaultValue={category?.slug} className={`${ADMIN_INPUT_CLASSES} font-mono text-xs`} />
        </FormField>
        <LocalizedField prefix="name" label="Name" value={category?.name ?? emptyLocalizedText()} required />
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <button type="submit" disabled={isPending} className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          {isPending ? "Saving…" : category ? "Save changes" : "Create category"}
        </button>
      </form>
    </Modal>
  );
}
