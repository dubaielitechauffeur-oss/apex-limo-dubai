"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createServiceAction, updateServiceAction, type CmsActionState } from "@/app/admin/(dashboard)/services/actions";
import { LocalizedField } from "@/components/admin/cms/LocalizedField";
import { MediaPickerField } from "@/components/admin/cms/MediaPickerField";
import { SlugField } from "@/components/admin/cms/SlugField";
import { SeoFieldsSection } from "@/components/admin/cms/SeoFieldsSection";
import { PublishStatusSelect } from "@/components/admin/cms/PublishStatusControls";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import { emptySeoMeta } from "@/lib/cms/seo";
import type { ServiceDetail } from "@/lib/cms/services";
import type { MediaPickerResult } from "@/lib/cms/media-picker-actions";

const initialState: CmsActionState = {};

export function ServiceForm({ service, mediaLibraryItems }: { service: ServiceDetail | null; mediaLibraryItems: MediaPickerResult[] }) {
  const action = service ? updateServiceAction : createServiceAction;
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

  const currentImage = service?.imageId ? (mediaLibraryItems.find((m) => m.id === service.imageId) ?? null) : null;
  const seo = service?.seo ?? emptySeoMeta();
  const ogImage = seo.ogImageId ? (mediaLibraryItems.find((m) => m.id === seo.ogImageId) ?? null) : null;

  return (
    <form action={formAction} className="space-y-6">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <LocalizedField prefix="name" label="Name" value={service?.name} required />
        <SlugField defaultValue={service?.slug} sourceFieldId="name_en" />
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="tagline" label="Tagline" value={service?.tagline} />
        <LocalizedField prefix="heroSubtitle" label="Hero subtitle" value={service?.heroSubtitle} />
        <LocalizedField prefix="shortDescription" label="Short description" value={service?.shortDescription} multiline />
        <LocalizedField
          prefix="longDescription"
          label="Long description"
          value={service?.longDescription}
          multiline
          hint="Separate paragraphs with a blank line."
        />
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <LocalizedField prefix="benefits" label="Benefits" value={service?.benefits} multiline hint="One benefit per line." />
        <LocalizedField prefix="whyChoose" label="Why choose us" value={service?.whyChoose} multiline hint="One point per line." />
        <LocalizedField prefix="tags" label="Tags" value={service?.tags} multiline hint="One short tag per line." />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <FormField id="ratingMetricValue" label="Rating metric value" hint='E.g. "500+"'>
          <input id="ratingMetricValue" name="ratingMetricValue" defaultValue={service?.ratingMetricValue} className={ADMIN_INPUT_CLASSES} />
        </FormField>
        <div className="sm:col-span-2">
          <LocalizedField prefix="ratingMetricLabel" label="Rating metric label" value={service?.ratingMetricLabel} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <MediaPickerField name="imageId" label="Service image" initial={currentImage} initialItems={mediaLibraryItems} />
      </div>

      <SeoFieldsSection seo={seo} ogImage={ogImage} mediaLibraryItems={mediaLibraryItems} />

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <PublishStatusSelect defaultValue={service?.status ?? "draft"} />
        <FormField id="sortOrder" label="Sort order" hint="Lower numbers appear first.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className={ADMIN_INPUT_CLASSES} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : service ? "Save changes" : "Create service"}
      </button>
    </form>
  );
}
