import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/shared/Container";
import ApexLogo from "./ApexLogo";
import Ltr from "@/components/shared/Ltr";
import {
  NAV_LINKS,
  SITE,
  getPhoneLink,
  getWhatsAppLink,
} from "@/lib/constants";
import { getAllServices } from "@/data/services";
import type { Locale } from "@/i18n/routing";

/** Curated footer order, mirroring the homepage LocationsShowcase pattern —
 *  "Jumeirah" links to the existing JBR page. `key` resolves its label from
 *  the same nav.locationsChildren.* translations the header dropdown uses. */
const FOOTER_LOCATIONS = [
  { slug: "dubai-marina", key: "dubaiMarina" },
  { slug: "downtown-dubai", key: "downtownDubai" },
  { slug: "palm-jumeirah", key: "palmJumeirah" },
  { slug: "business-bay", key: "businessBay" },
  { slug: "jbr", key: "jumeirah" },
  { slug: "dubai-international-airport-dxb", key: "dubaiAirport" },
];

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("common");
  const services = getAllServices(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/15 bg-obsidian">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <ApexLogo size="md" align="center" className="sm:items-start sm:text-start" />
            <p className="mt-6 max-w-xs text-center text-sm leading-relaxed text-smoke sm:text-start">
              {t("siteTagline")}. {t("footer.tagline")}
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="label-eyebrow mb-5">{t("footer.explore")}</h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="label-eyebrow mb-5">{t("footer.services")}</h3>
            <ul className="flex flex-col gap-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="label-eyebrow mb-5">{t("footer.locations")}</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LOCATIONS.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="text-sm text-smoke transition-colors hover:text-gold"
                  >
                    {t(`nav.locationsChildren.${location.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="label-eyebrow mb-5">{t("footer.reachUs")}</h3>
            <ul className="flex flex-col gap-3 text-sm text-smoke">
              <li>
                <a href={getPhoneLink()} className="transition-colors hover:text-gold">
                  <Ltr>{SITE.phoneDisplay}</Ltr>
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink(t("whatsappGenericMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  {t("footer.whatsappUs")}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors hover:text-gold"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="pt-1 text-smoke/80">{t("footer.address")}</li>
            </ul>
          </div>
        </div>

        <div className="route-line my-10 opacity-40" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-smoke/70 sm:flex-row">
          <p>
            &copy; {year} {SITE.name}. {t("footer.rightsReserved")}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-gold">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gold">
              {t("footer.termsConditions")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
