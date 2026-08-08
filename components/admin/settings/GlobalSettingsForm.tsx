"use client";

import { useActionState, useEffect } from "react";
import { updateGlobalSettingsAction, type CmsActionState } from "@/app/admin/(dashboard)/settings/actions";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";
import type { GlobalSettings } from "@/lib/generated/prisma/client";

const initialState: CmsActionState = {};

/** The one form that changes what customers see site-wide with a single
 *  save — phone/WhatsApp/email feed `lib/public/site-contact.ts`, read by
 *  the header, footer, floating WhatsApp/call buttons, the construction
 *  notice modal, and every page that displays contact info or emits
 *  LocalBusiness JSON-LD. */
export function GlobalSettingsForm({ settings }: { settings: GlobalSettings | null }) {
  const [state, formAction, isPending] = useActionState(updateGlobalSettingsAction, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) showToast(state.success, "success");
    else if (state.error) showToast(state.error, "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">General</h2>
        <p className="mt-1 text-sm text-gray-500">Company identity and display basics.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="companyName" label="Company name" required>
            <input id="companyName" name="companyName" required defaultValue={settings?.companyName} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="shortName" label="Short name" required>
            <input id="shortName" name="shortName" required defaultValue={settings?.shortName} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="defaultCurrency" label="Default currency">
            <input id="defaultCurrency" name="defaultCurrency" defaultValue={settings?.defaultCurrency ?? "AED"} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="timezone" label="Timezone">
            <input id="timezone" name="timezone" defaultValue={settings?.timezone ?? "Asia/Dubai"} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="fleetSizeDisplay" label="Fleet size display" hint='Marketing copy, e.g. "50+".'>
            <input id="fleetSizeDisplay" name="fleetSizeDisplay" defaultValue={settings?.fleetSizeDisplay ?? "50+"} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="ratingDisplay" label="Rating display" hint='e.g. "4.9".'>
            <input id="ratingDisplay" name="ratingDisplay" defaultValue={settings?.ratingDisplay ?? "4.9"} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
        <p className="mt-1 text-sm text-gray-500">
          Public-facing contact details — changing these updates the header, footer, WhatsApp/call buttons, and contact
          pages everywhere on the site.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="phone" label="Phone (tel: link)" required hint='E.164-ish format, e.g. "+971529426152".'>
            <input id="phone" name="phone" required defaultValue={settings?.phone} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="phoneDisplay" label="Phone (display)" required hint='e.g. "+971 52 942 6152".'>
            <input id="phoneDisplay" name="phoneDisplay" required defaultValue={settings?.phoneDisplay} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="whatsapp" label="WhatsApp number" required hint="Same format as phone.">
            <input id="whatsapp" name="whatsapp" required defaultValue={settings?.whatsapp} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="email" label="Public email" required>
            <input id="email" name="email" type="email" required defaultValue={settings?.email} className={ADMIN_INPUT_CLASSES} />
          </FormField>
          <FormField id="notificationEmail" label="Notification email" required hint="Where booking/quote/contact form leads are sent.">
            <input id="notificationEmail" name="notificationEmail" type="email" required defaultValue={settings?.notificationEmail} className={ADMIN_INPUT_CLASSES} />
          </FormField>
        </div>
      </div>

      <button type="submit" disabled={isPending} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
