"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, SelectField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import {
  createFolderAction,
  renameFolderAction,
  moveFolderAction,
  deleteFolderAction,
  type MediaActionState,
} from "@/app/admin/(dashboard)/media/actions";
import type { MediaFolderNode } from "@/lib/media/folders";

interface FolderTreeRow extends MediaFolderNode {
  depth: number;
}

function flattenTree(folders: MediaFolderNode[]): FolderTreeRow[] {
  const byParent = new Map<string | null, MediaFolderNode[]>();
  for (const folder of folders) {
    const list = byParent.get(folder.parentId) ?? [];
    list.push(folder);
    byParent.set(folder.parentId, list);
  }
  const rows: FolderTreeRow[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const folder of byParent.get(parentId) ?? []) {
      rows.push({ ...folder, depth });
      walk(folder.id, depth + 1);
    }
  }
  walk(null, 0);
  return rows;
}

const initialState: MediaActionState = {};

export function FolderPanel({ folders, activeFolderId }: { folders: MediaFolderNode[]; activeFolderId: string | null }) {
  const rows = flattenTree(folders);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<MediaFolderNode | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const totalItemCount = folders.reduce((sum, f) => sum + f.itemCount, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Folders</h2>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="New folder"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <nav className="space-y-0.5">
        <FolderRow
          label="All media"
          count={totalItemCount}
          href="/admin/media"
          active={activeFolderId === null}
        />
        {rows.map((row) => (
          <div key={row.id} className="group flex items-center gap-1" style={{ paddingLeft: `${row.depth * 12}px` }}>
            <FolderRow
              label={row.name}
              count={row.itemCount}
              href={`/admin/media?${new URLSearchParams({ ...Object.fromEntries(searchParams), folder: row.id }).toString()}`}
              active={activeFolderId === row.id}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setEditing(row)}
              aria-label={`Edit ${row.name}`}
              className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 group-hover:flex"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <ConfirmDialog
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  aria-label={`Delete ${row.name}`}
                  className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 group-hover:flex"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              title={`Delete "${row.name}"?`}
              description="Only an empty folder (no files, no subfolders) can be deleted. Move or delete its contents first."
              confirmLabel="Delete folder"
              tone="danger"
              onConfirm={async () => {
                const result = await deleteFolderAction(row.id);
                if (!result.success) {
                  showToast(result.error ?? "Could not delete folder.", "error");
                  return;
                }
                showToast(result.success ?? "Folder deleted.", "success");
                if (activeFolderId === row.id) router.push("/admin/media");
                else router.refresh();
              }}
            />
          </div>
        ))}
      </nav>

      <CreateFolderModal open={createOpen} onClose={() => setCreateOpen(false)} folders={folders} />
      {editing ? (
        <EditFolderModal folder={editing} folders={folders} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function FolderRow({
  label,
  count,
  href,
  active,
  className = "",
}: {
  label: string;
  count: number;
  href: string;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
      } ${className}`}
    >
      <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{label}</span>
      <span className={`text-xs ${active ? "text-gray-300" : "text-gray-400"}`}>{count}</span>
    </Link>
  );
}

function CreateFolderModal({ open, onClose, folders }: { open: boolean; onClose: () => void; folders: MediaFolderNode[] }) {
  const [state, formAction, isPending] = useActionState(createFolderAction, initialState);
  const { showToast } = useToast();
  const router = useRouter();

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
    <Modal open={open} onClose={onClose} title="New folder">
      <form action={formAction} className="space-y-4">
        <FormField id="name" label="Folder name" required>
          <input id="name" name="name" required className={ADMIN_INPUT_CLASSES} autoFocus />
        </FormField>
        <FormField id="parentId" label="Parent folder">
          <SelectField id="parentId">
            <option value="">— Root —</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </SelectField>
        </FormField>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create folder"}
        </button>
      </form>
    </Modal>
  );
}

function EditFolderModal({
  folder,
  folders,
  onClose,
}: {
  folder: MediaFolderNode;
  folders: MediaFolderNode[];
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const name = String(formData.get("name") ?? "");
    const parentId = String(formData.get("parentId") ?? "") || null;

    const renameResult = await renameFolderAction(folder.id, name);
    if (!renameResult.success) {
      showToast(renameResult.error ?? "Could not rename folder.", "error");
      setPending(false);
      return;
    }

    if (parentId !== folder.parentId) {
      const moveResult = await moveFolderAction(folder.id, parentId);
      if (!moveResult.success) {
        showToast(moveResult.error ?? "Could not move folder.", "error");
        setPending(false);
        return;
      }
    }

    showToast("Folder updated.", "success");
    setPending(false);
    router.refresh();
    onClose();
  }

  // Candidate parents exclude the folder itself (self-parent is nonsensical
  // and already rejected server-side; filtering here just keeps the picker
  // from offering an obviously-invalid choice).
  const parentOptions = folders.filter((f) => f.id !== folder.id);

  return (
    <Modal open onClose={onClose} title={`Edit "${folder.name}"`}>
      <form action={handleSubmit} className="space-y-4">
        <FormField id="edit-name" label="Folder name" required>
          <input id="edit-name" name="name" required defaultValue={folder.name} className={ADMIN_INPUT_CLASSES} autoFocus />
        </FormField>
        <FormField id="edit-parentId" label="Parent folder">
          <SelectField id="edit-parentId" defaultValue={folder.parentId ?? ""}>
            <option value="">— Root —</option>
            {parentOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </SelectField>
        </FormField>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}
