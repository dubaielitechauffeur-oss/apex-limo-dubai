"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createFaqAction, updateFaqAction } from "@/app/admin/(dashboard)/faq/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { FormField, SelectField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { emptyLocalizedText } from "@/lib/cms/localized";
import type { FaqDetail, FaqCategoryItem, ParentOption, FaqParentType } from "@/lib/cms/faq";

const initialState: CmsActionState = {};

export function FaqForm({
  faq,
  categories,
  parentOptions,
}: {
  faq: FaqDetail | null;
  categories: FaqCategoryItem[];
  parentOptions: { vehicles: ParentOption[]; services: ParentOption[]; locations: ParentOption[] };
}) {
  const action = faq ? updateFaqAction : createFaqAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  const initialParentType: FaqParentType = faq?.vehicleId ? "vehicle" : faq?.serviceId ? "service" : faq?.locationId ? "location" : "general";
  const [parentType, setParentType] = useState<FaqParentType>(initialParentType);

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
    <form action={formAction} className="space-y-6">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="question" label="Question" value={faq?.question ?? emptyLocalizedText()} required />
        <LocalizedField prefix="answer" label="Answer" value={faq?.answer ?? emptyLocalizedText()} multiline required />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="categoryId" label="Category">
          <SelectField id="categoryId" defaultValue={faq?.categoryId ?? ""}>
            <option value="">— None —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name.en || cat.key}</option>
            ))}
          </SelectField>
        </FormField>
        <FormField id="sortOrder" label="Sort order">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <FormField id="parentType" label="Scope" hint="Optionally attach this FAQ to a single vehicle, service, or location — otherwise it's a general FAQ.">
          <SelectField id="parentType" value={parentType} onChange={(value) => setParentType(value as FaqParentType)}>
            <option value="general">General (no scope)</option>
            <option value="vehicle">Vehicle</option>
            <option value="service">Service</option>
            <option value="location">Location</option>
          </SelectField>
        </FormField>

        {parentType === "vehicle" ? (
          <FormField id="vehicleId" label="Vehicle">
            <SelectField id="vehicleId" defaultValue={faq?.vehicleId ?? ""}>
              <option value="">— Select a vehicle —</option>
              {parentOptions.vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </SelectField>
            {parentOptions.vehicles.length === 0 ? <p className="mt-1 text-xs text-gray-400">No vehicles exist yet (Fleet CMS ships in a later phase).</p> : null}
          </FormField>
        ) : null}
        {parentType === "service" ? (
          <FormField id="serviceId" label="Service">
            <SelectField id="serviceId" defaultValue={faq?.serviceId ?? ""}>
              <option value="">— Select a service —</option>
              {parentOptions.services.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </SelectField>
          </FormField>
        ) : null}
        {parentType === "location" ? (
          <FormField id="locationId" label="Location">
            <SelectField id="locationId" defaultValue={faq?.locationId ?? ""}>
              <option value="">— Select a location —</option>
              {parentOptions.locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </SelectField>
          </FormField>
        ) : null}
      </div>

      <button type="submit" disabled={isPending} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
        {isPending ? "Saving…" : faq ? "Save changes" : "Create FAQ"}
      </button>
    </form>
  );
}
