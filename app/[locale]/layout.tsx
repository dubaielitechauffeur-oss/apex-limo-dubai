import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloatButton from "@/components/layout/WhatsAppFloatButton";
import CallFloatButton from "@/components/layout/CallFloatButton";
import ConditionalFloatButtons from "@/components/layout/ConditionalFloatButtons";
import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import ConstructionNoticeModal from "@/components/layout/ConstructionNoticeModal";
import { getDefaultMetadata, organizationJsonLd } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { logoFont } from "@/fonts/logo";

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const t = await getTranslations({ locale, namespace: "common" });
  return getDefaultMetadata(locale as Locale, t("siteTagline"));
}

/**
 * Loads only the display/body font module a given locale actually needs —
 * a dynamic import per locale, not a static top-level import of all three
 * script modules, so an English (or Russian/French/German) page never pays
 * the preload cost of the Arabic or Chinese webfonts it doesn't render.
 */
async function loadScriptFonts(locale: Locale) {
  if (locale === "ar") return import("@/fonts/arabic");
  if (locale === "zh") return import("@/fonts/zh");
  return import("@/fonts/latin");
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const [messages, { displayFont, bodyFont }, t] = await Promise.all([
    getMessages(),
    loadScriptFonts(typedLocale),
    getTranslations({ locale: typedLocale, namespace: "common.a11y" }),
  ]);

  const dir = typedLocale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={typedLocale}
      dir={dir}
      className={`${displayFont.variable} ${bodyFont.variable} ${logoFont.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(typedLocale)),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="fixed start-4 top-4 z-[200] -translate-y-24 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-obsidian transition-transform duration-150 focus:translate-y-0"
          >
            {t("skipToContent")}
          </a>
          <ConstructionNoticeModal />
          <Header />
          <main id="main-content" className="flex-1 pt-[117px]">{children}</main>
          <Footer />
          <ConditionalFloatButtons>
            <WhatsAppFloatButton />
            <CallFloatButton />
          </ConditionalFloatButtons>
          <ScrollToTopButton />
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-B37R3PW9NG" />
    </html>
  );
}
