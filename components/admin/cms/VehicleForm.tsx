"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createVehicleAction, updateVehicleAction, type CmsActionState } from "@/app/admin/(dashboard)/fleet/actions";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { VehicleImagesManager } from "@/components/admin/cms/VehicleImagesManager";
import { SlugField } from "@/components/admin/cms/SlugField";
import { SeoFieldsSection } from "@/components/admin/cms/SeoFieldsSection";
import { PublishStatusSelect } from "@/components/admin/cms/PublishStatusControls";
import { FormField, SelectField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { emptyLocalizedText } from "@/lib/cms/localized";
import { emptySeoMeta } from "@/lib/cms/seo";
import type { VehicleDetail, VehicleCategoryItem } from "@/lib/cms/fleet";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function VehicleForm({
  vehicle,
  categories,
  mediaLibraryItems,
}: {
  vehicle: VehicleDetail | null;
  categories: VehicleCategoryItem[];
  mediaLibraryItems: MediaPickerResult[];
}) {
  const action = vehicle ? updateVehicleAction : createVehicleAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
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

  const seo = vehicle?.seo ?? emptySeoMeta();
  const ogImage = seo.ogImageId ? (mediaLibraryItems.find((m) => m.id === seo.ogImageId) ?? null) : null;
  const orderedCurrentImages = vehicle
    ? vehicle.images.map((i) => mediaLibraryItems.find((m) => m.id === i.mediaId)).filter((m): m is MediaPickerResult => Boolean(m))
    : [];
  const orderedCurrentMobiles = vehicle
    ? vehicle.images.map((i) => (i.mobileMediaId ? (mediaLibraryItems.find((m) => m.id === i.mobileMediaId) ?? null) : null))
    : [];

  return (
    <form action={formAction} className="space-y-6">
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="name" label="Name" required hint='Proper noun, invariant across locales — e.g. "Rolls-Royce Phantom"'>
          <input id="name" name="name" required defaultValue={vehicle?.name} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <SlugField defaultValue={vehicle?.slug} sourceFieldId="name" />
        <FormField id="brand" label="Brand" required>
          <input id="brand" name="brand" required defaultValue={vehicle?.brand} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField id="model" label="Model" required>
          <input id="model" name="model" required defaultValue={vehicle?.model} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField id="categoryId" label="Category" required>
          <SelectField id="categoryId" defaultValue={vehicle?.categoryId ?? categories[0]?.id}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name.en}</option>
            ))}
          </SelectField>
        </FormField>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isElectric" defaultChecked={vehicle?.isElectric} className="h-4 w-4 rounded border-gray-300" />
            Electric
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isFeatured" defaultChecked={vehicle?.isFeatured} className="h-4 w-4 rounded border-gray-300" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isPlaceholder" defaultChecked={vehicle?.isPlaceholder} className="h-4 w-4 rounded border-gray-300" />
            Placeholder (preview)
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="tagline" label="Tagline" value={vehicle?.tagline} />
        <LocalizedField prefix="description" label="Short description" value={vehicle?.description} multiline required />
        <LocalizedField prefix="longDescription" label="Long description" value={vehicle?.longDescription} multiline />
        <LocalizedField prefix="idealFor" label="Popular for" value={vehicle?.idealFor} hint='What this vehicle is popular for — comma-separated. E.g. "Event Transportation, Downtown Dubai". Shows as tags on the public detail page.' />
        <LocalizedField prefix="features" label="Features" value={vehicle?.features} multiline hint="One feature per line." />
        <LocalizedField prefix="whyChoose" label="Why choose this vehicle" value={vehicle?.whyChoose} multiline hint="One point per line." />
        <LocalizedField prefix="badge" label="Badge" value={vehicle?.badge ?? emptyLocalizedText()} hint='Optional standout label, e.g. "VIP Choice". Leave blank for none.' />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="passengers" label="Passenger capacity" required>
          <input id="passengers" name="passengers" type="number" min={1} required defaultValue={vehicle?.passengers ?? 4} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField id="luggage" label="Luggage capacity" required>
          <input id="luggage" name="luggage" type="number" min={0} required defaultValue={vehicle?.luggage ?? 2} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">Chauffeur-hire rates (AED)</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormField id="rates_tenHours" label="10 hours">
            <input id="rates_tenHours" name="rates_tenHours" type="number" min={0} defaultValue={vehicle?.rates.tenHours ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="rates_fiveHours" label="5 hours">
            <input id="rates_fiveHours" name="rates_fiveHours" type="number" min={0} defaultValue={vehicle?.rates.fiveHours ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="rates_oneHour" label="1 hour">
            <input id="rates_oneHour" name="rates_oneHour" type="number" min={0} defaultValue={vehicle?.rates.oneHour ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="rates_airport" label="Airport transfer">
            <input id="rates_airport" name="rates_airport" type="number" min={0} defaultValue={vehicle?.rates.airport ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="rates_extraHour" label="Extra hour">
            <input id="rates_extraHour" name="rates_extraHour" type="number" min={0} defaultValue={vehicle?.rates.extraHour ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="rates_additionalCity" label="Additional city">
            <input id="rates_additionalCity" name="rates_additionalCity" type="number" min={0} defaultValue={vehicle?.rates.additionalCity ?? 0} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <VehicleImagesManager
          name="imageIds"
          mobileName="mobileImageIds"
          initial={orderedCurrentImages}
          initialMobiles={orderedCurrentMobiles}
          initialItems={mediaLibraryItems}
        />
      </div>

      <SeoFieldsSection seo={seo} ogImage={ogImage} mediaLibraryItems={mediaLibraryItems} />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <PublishStatusSelect defaultValue={vehicle?.status ?? "draft"} />
        <FormField id="sortOrder" label="Sort order" hint="Lower numbers appear first.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={vehicle?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : vehicle ? "Save changes" : "Create vehicle"}
      </button>
    </form>
  );
}
