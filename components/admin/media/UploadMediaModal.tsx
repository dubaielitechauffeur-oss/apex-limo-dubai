"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { FormField, SelectField } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { uploadMediaAction, type MediaActionState } from "@/app/admin/(dashboard)/media/actions";
import type { MediaFolderNode } from "@/lib/media/folders";
import { MAX_UPLOAD_BYTES } from "@/lib/media/constants";

const VARIANT_OPTIONS = ["original", "desktop", "mobile", "thumbnail", "og"] as const;
const initialState: MediaActionState = {};
const MAX_UPLOAD_MB = Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024));

export function UploadMediaModal({ folders, currentFolderId }: { folders: MediaFolderNode[]; currentFolderId: string | null }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const router = useRouter();

  // Close the modal and clear the picked-file label as soon as a new
  // successful result comes back — adjusted during render (React's
  // documented pattern for resetting state when something changes) rather
  // than in the effect below, which is reserved for the actual side effects
  // (toast, imperative form reset, navigation refresh).
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.success) {
      setFileName(null);
      setOpen(false);
    }
  }

  useEffect(() => {
    if (state.success) {
      showToast(state.success, "success");
      formRef.current?.reset();
      router.refresh();
    } else if (state.error) {
      showToast(state.error, "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        Upload Media
      </button>

      <Modal open={open} onClose={() => !isPending && setOpen(false)} title="Upload media">
        <form ref={formRef} action={formAction} className="space-y-4">
          <FormField id="file" label="File" required hint={`JPEG, PNG, WebP, or AVIF — up to ${MAX_UPLOAD_MB} MB.`}>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
          </FormField>

          <FormField id="folderId" label="Folder">
            <SelectField id="folderId" defaultValue={currentFolderId ?? ""}>
              <option value="">— Root —</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </SelectField>
          </FormField>

          <FormField id="variant" label="Variant" hint="Optional — tag what this image is intended for.">
            <SelectField id="variant" defaultValue="">
              <option value="">— Not tagged —</option>
              {VARIANT_OPTIONS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </SelectField>
          </FormField>

          <button
            type="submit"
            disabled={isPending || !fileName}
            className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Uploading…" : "Upload"}
          </button>
        </form>
      </Modal>
    </>
  );
}
