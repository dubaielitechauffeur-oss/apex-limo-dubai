"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLocationAction, updateLocationAction } from "@/app/admin/(dashboard)/locations/actions";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { SlugField } from "@/components/admin/cms/SlugField";
import { SeoFieldsSection } from "@/components/admin/cms/SeoFieldsSection";
import { PublishStatusSelect } from "@/components/admin/cms/PublishStatusControls";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { emptySeoMeta } from "@/lib/cms/seo";
import type { LocationDetail } from "@/lib/cms/locations";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function LocationForm({ location, mediaLibraryItems }: { location: LocationDetail | null; mediaLibraryItems: MediaPickerResult[] }) {
  const action = location ? updateLocationAction : createLocationAction;
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

  const heroDesktop = location?.heroDesktopImageId ? (mediaLibraryItems.find((m) => m.id === location.heroDesktopImageId) ?? null) : null;
  const heroMobile = location?.heroMobileImageId ? (mediaLibraryItems.find((m) => m.id === location.heroMobileImageId) ?? null) : null;
  const seo = location?.seo ?? emptySeoMeta();
  const ogImage = seo.ogImageId ? (mediaLibraryItems.find((m) => m.id === seo.ogImageId) ?? null) : null;

  return (
    <form action={formAction} className="space-y-6">
      {location ? <input type="hidden" name="id" value={location.id} /> : null}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="name" label="Name" required hint='Not localized in the schema — one name across all locales (e.g. "Downtown Dubai").'>
          <input id="name" name="name" required defaultValue={location?.name} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <SlugField defaultValue={location?.slug} sourceFieldId="name" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isAirport" defaultChecked={location?.isAirport} className="h-4 w-4 rounded border-gray-300" />
          This is an airport location
        </label>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="tagline" label="Tagline" value={location?.tagline} />
        <LocalizedField prefix="heroSubtitle" label="Hero subtitle" value={location?.heroSubtitle} />
        <LocalizedField prefix="shortDescription" label="Short description" value={location?.shortDescription} multiline />
        <LocalizedField prefix="longDescription" label="Long description" value={location?.longDescription} multiline hint="Separate paragraphs with a blank line." />
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="landmarks" label="Landmarks" value={location?.landmarks} multiline hint="One landmark per line." />
        <LocalizedField prefix="whyChoose" label="Why choose us" value={location?.whyChoose} multiline hint="One point per line." />
        <LocalizedField prefix="tags" label="Tags" value={location?.tags} multiline hint="One short tag per line." />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="geoLat" label="Latitude">
          <input id="geoLat" name="geoLat" type="number" step="any" defaultValue={location?.geoLat} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <FormField id="geoLng" label="Longitude">
          <input id="geoLng" name="geoLng" type="number" step="any" defaultValue={location?.geoLng} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <MediaPickerField name="heroDesktopImageId" label="Hero image (desktop)" initial={heroDesktop} initialItems={mediaLibraryItems} />
        <MediaPickerField name="heroMobileImageId" label="Hero image (mobile)" initial={heroMobile} initialItems={mediaLibraryItems} />
      </div>

      <SeoFieldsSection seo={seo} ogImage={ogImage} mediaLibraryItems={mediaLibraryItems} />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <PublishStatusSelect defaultValue={location?.status ?? "draft"} />
        <FormField id="sortOrder" label="Sort order" hint="Lower numbers appear first.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={location?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <button type="submit" disabled={isPending} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
        {isPending ? "Saving…" : location ? "Save changes" : "Create location"}
      </button>
    </form>
  );
}
