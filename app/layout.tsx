import type { Metadata } from "next";
import { Playfair_Display, Inter, Saira } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloatButton from "@/components/layout/WhatsAppFloatButton";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import { defaultMetadata, organizationJsonLd } from "@/lib/seo";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

/** Used only for the "APEX" brand wordmark (header + footer) — a bold
 *  italic geometric display face for a clean, premium, text-only logo. */
const saira = Saira({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["italic"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} ${saira.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>
          <Header />
          <main className="flex-1 pt-[117px]">{children}</main>
          <Footer />
          <WhatsAppFloatButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
