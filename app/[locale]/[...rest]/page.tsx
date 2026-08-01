import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Catch-all for any path under a valid locale that doesn't match a real
 * route. Without this, Next.js can't match the URL to any route pattern at
 * all (as opposed to a defined route calling `notFound()` itself), so it
 * never reaches app/[locale]/not-found.tsx and falls back to its own
 * untranslated built-in 404 instead. Calling notFound() from here — a
 * route that *does* match — is what makes the nested boundary activate.
 */
export default async function CatchAll({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  notFound();
}
