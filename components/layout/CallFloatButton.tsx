import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { getPhoneLink, SITE } from "@/lib/constants";
import { getSiteContact } from "@/lib/public/site-contact";

/**
 * Persistent floating action button, fixed bottom-left on every page —
 * mirrors WhatsAppFloatButton on the opposite side. Kept as a server
 * component — no interactivity beyond a native tel: link, so no client JS
 * is shipped for it.
 */
export default async function CallFloatButton() {
  const [t, contact] = await Promise.all([getTranslations("common.a11y"), getSiteContact()]);
  return (
    <a
      href={getPhoneLink(contact.phone)}
      aria-label={t("callAriaLabelTemplate", { name: SITE.name })}
      className="fixed bottom-6 start-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 sm:bottom-8 sm:start-8"
    >
      <Phone className="h-6 w-6 text-obsidian" strokeWidth={2} aria-hidden="true" />
    </a>
  );
}
