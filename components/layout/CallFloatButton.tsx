import { Phone } from "lucide-react";
import { getPhoneLink, SITE } from "@/lib/constants";

/**
 * Persistent floating action button, fixed bottom-left on every page —
 * mirrors WhatsAppFloatButton on the opposite side. Kept as a server
 * component — no interactivity beyond a native tel: link, so no client JS
 * is shipped for it.
 */
export default function CallFloatButton() {
  return (
    <a
      href={getPhoneLink()}
      aria-label={`Call ${SITE.name}`}
      className="fixed bottom-6 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 sm:bottom-8 sm:left-8"
    >
      <Phone className="h-6 w-6 text-obsidian" strokeWidth={2} aria-hidden="true" />
    </a>
  );
}
