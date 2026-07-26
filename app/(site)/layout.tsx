import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloatButton from "@/components/layout/WhatsAppFloatButton";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import { organizationJsonLd } from "@/lib/seo";

/**
 * Layout for every public marketing page. Scoped to the `(site)` route
 * group so `/admin` (a sibling of this group) never inherits the public
 * Header/Footer/WhatsApp button or the sitewide LocalBusiness JSON-LD —
 * route groups don't add a URL segment, so no public URL changes.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      <LanguageProvider>
        <Header />
        <main className="flex-1 pt-[117px]">{children}</main>
        <Footer />
        <WhatsAppFloatButton />
      </LanguageProvider>
    </>
  );
}
