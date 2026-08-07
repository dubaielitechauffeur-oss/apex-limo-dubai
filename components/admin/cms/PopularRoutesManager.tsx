"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { addPopularRouteAction, deletePopularRouteAction } from "@/app/admin/(dashboard)/locations/actions";
import type { PopularRouteItem } from "@/lib/cms/locations";

/** Popular routes are managed as their own mini-CRUD (add/delete) rather
 *  than folded into the big location form's single submit — same reasoning
 *  as Phase 6's MediaFolder management: a separate list of child rows
 *  shouldn't force a save of the whole parent record just to add one row.
 *  Quick-add only fills the English (default) locale; translators refine
 *  the rest later, same convention as MediaItem's auto-seeded alt text. */
export function PopularRoutesManager({ locationId, routes }: { locationId: string; routes: PopularRouteItem[] }) {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleAdd(formData: FormData) {
    setPending(true);
    const result = await addPopularRouteAction(
      locationId,
      String(formData.get("from") ?? ""),
      String(formData.get("to") ?? ""),
      String(formData.get("duration") ?? "")
    );
    setPending(false);
    if (!result.success) {
      showToast(result.error ?? "Could not add route.", "error");
      return;
    }
    formRef.current?.reset();
    showToast(result.success ?? "Route added.", "success");
    router.refresh();
  }

  async function handleDelete(routeId: string) {
    const result = await deletePopularRouteAction(locationId, routeId);
    if (!result.success) showToast(result.error ?? "Could not remove route.", "error");
    else {
      showToast(result.success ?? "Removed.", "success");
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">Popular Routes</h2>
      {routes.length > 0 ? (
        <ul className="mt-3 divide-y divide-gray-100">
          {routes.map((route) => (
            <li key={route.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-gray-700">
                {route.from.en} → {route.to.en} <span className="text-gray-400">({route.duration.en})</span>
              </span>
              <button type="button" onClick={() => handleDelete(route.id)} aria-label="Remove route" className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-400">No popular routes yet.</p>
      )}

      <form ref={formRef} action={handleAdd} className="mt-4 flex flex-wrap items-end gap-2">
        <input name="from" placeholder="From (e.g. Dubai Airport)" required className={`${ADMIN_INPUT_CLASSES} w-40`} />
        <input name="to" placeholder="To (e.g. Downtown Dubai)" required className={`${ADMIN_INPUT_CLASSES} w-40`} />
        <input name="duration" placeholder="Duration (e.g. 25 min)" className={`${ADMIN_INPUT_CLASSES} w-32`} />
        <button type="submit" disabled={pending} className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </form>
    </div>
  );
}
