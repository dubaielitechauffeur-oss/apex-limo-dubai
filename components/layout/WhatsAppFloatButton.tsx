import { getWhatsAppLink } from "@/lib/constants";

/**
 * Persistent floating action button, fixed bottom-right on every page.
 * Kept as a server component — no interactivity beyond a native link,
 * so no client JS is shipped for it.
 */
export default function WhatsAppFloatButton() {
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Apex Limo on WhatsApp"
      className="group fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 sm:bottom-8 sm:right-8"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-slow rounded-full bg-[#25D366]/40" />
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 fill-white"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818c-1.99 0-3.86-.55-5.457-1.507l-.392-.232-4.58 1.107 1.128-4.462-.256-.406A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.965-8.14c-.327-.164-1.936-.955-2.237-1.064-.3-.109-.518-.164-.737.164-.218.327-.845 1.064-1.036 1.282-.19.218-.382.246-.709.082-.327-.164-1.38-.508-2.629-1.62-.972-.867-1.628-1.937-1.819-2.264-.19-.327-.02-.504.144-.667.148-.147.327-.382.49-.573.164-.19.218-.327.327-.545.109-.218.055-.41-.027-.573-.082-.164-.737-1.777-1.01-2.434-.266-.64-.537-.553-.737-.563l-.628-.011c-.218 0-.573.082-.873.41-.3.327-1.145 1.12-1.145 2.73 0 1.61 1.172 3.165 1.336 3.383.164.218 2.308 3.524 5.593 4.942.782.338 1.392.54 1.868.69.785.25 1.5.215 2.065.13.63-.094 1.936-.79 2.21-1.554.273-.764.273-1.418.19-1.555-.081-.136-.3-.218-.627-.382z" />
      </svg>
    </a>
  );
}
