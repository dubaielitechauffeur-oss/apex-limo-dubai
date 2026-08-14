"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { useToast } from "@/components/admin/ui/Toast";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import {
  addVehicleFaqAction,
  updateVehicleFaqAction,
  deleteVehicleFaqAction,
  type CmsActionState,
} from "@/app/admin/(dashboard)/fleet/actions";
import type { ScopedFaqItem } from "@/lib/cms/faq";
import { emptyLocalizedText } from "@/lib/cms/localized";

/**
 * Inline FAQ manager for the vehicle detail page. List + add + edit + delete
 * scoped to the current vehicle, no round-trip to the standalone /admin/faq
 * page. Same interaction shape as PopularRoutesManager: each mutation is its
 * own tiny server action, no batch save.
 */
export function VehicleFaqsManager({
  vehicleId,
  faqs,
  canEdit,
  canDelete,
}: {
  vehicleId: string;
  faqs: ScopedFaqItem[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">FAQs on this vehicle</h2>
          <p className="mt-1 text-xs text-gray-500">
            {faqs.length} FAQ{faqs.length === 1 ? "" : "s"} — shown on the public detail page in this order.
          </p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {showAddForm ? "Cancel" : "Add FAQ"}
          </button>
        ) : null}
      </div>

      {showAddForm && canEdit ? (
        <AddFaqForm
          vehicleId={vehicleId}
          defaultSortOrder={faqs.length}
          onDone={() => {
            setShowAddForm(false);
            router.refresh();
          }}
        />
      ) : null}

      {faqs.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No FAQs yet. Add at least 6 for the best public detail page.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <li key={faq.id} className="py-2">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="flex flex-1 items-start gap-2 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    )}
                    <span className="text-sm text-gray-800">{faq.question.en || <span className="italic text-gray-400">(no English question)</span>}</span>
                  </button>
                  {canDelete ? (
                    <DeleteFaqButton
                      vehicleId={vehicleId}
                      faqId={faq.id}
                      questionEn={faq.question.en}
                      onDone={() => router.refresh()}
                    />
                  ) : null}
                </div>
                {isExpanded && canEdit ? (
                  <EditFaqForm
                    vehicleId={vehicleId}
                    faq={faq}
                    onDone={() => {
                      setExpandedId(null);
                      router.refresh();
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AddFaqForm({
  vehicleId,
  defaultSortOrder,
  onDone,
}: {
  vehicleId: string;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          const result: CmsActionState = await addVehicleFaqAction(vehicleId, {}, formData);
          if (result.error) {
            showToast(result.error, "error");
          } else {
            showToast(result.success ?? "FAQ added.", "success");
            onDone();
          }
        });
      }}
      className="mt-4 space-y-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4"
    >
      <LocalizedField prefix="question" label="Question" value={emptyLocalizedText()} />
      <LocalizedField prefix="answer" label="Answer" value={emptyLocalizedText()} multiline />
      <input type="hidden" name="sortOrder" value={defaultSortOrder} />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add FAQ"}
        </button>
      </div>
    </form>
  );
}

function EditFaqForm({
  vehicleId,
  faq,
  onDone,
}: {
  vehicleId: string;
  faq: ScopedFaqItem;
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          const result: CmsActionState = await updateVehicleFaqAction(vehicleId, faq.id, {}, formData);
          if (result.error) {
            showToast(result.error, "error");
          } else {
            showToast(result.success ?? "FAQ updated.", "success");
            onDone();
          }
        });
      }}
      className="mt-3 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
    >
      <LocalizedField prefix="question" label="Question" value={faq.question} />
      <LocalizedField prefix="answer" label="Answer" value={faq.answer} multiline />
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs text-gray-600">
          Sort order
          <input
            type="number"
            name="sortOrder"
            defaultValue={faq.sortOrder}
            className={`${ADMIN_INPUT_CLASSES} mt-1 w-24`}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function DeleteFaqButton({
  vehicleId,
  faqId,
  questionEn,
  onDone,
}: {
  vehicleId: string;
  faqId: string;
  questionEn: string;
  onDone: () => void;
}) {
  const { showToast } = useToast();
  return (
    <ConfirmDialog
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          aria-label="Delete FAQ"
          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      title="Delete this FAQ?"
      description={questionEn ? `"${questionEn}" will be permanently removed from this vehicle.` : "This FAQ will be permanently removed."}
      confirmLabel="Delete"
      tone="danger"
      onConfirm={async () => {
        const result = await deleteVehicleFaqAction(vehicleId, faqId);
        if (result.error) showToast(result.error, "error");
        else {
          showToast(result.success ?? "FAQ deleted.", "success");
          onDone();
        }
      }}
    />
  );
}
