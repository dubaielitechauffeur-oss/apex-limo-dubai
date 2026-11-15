import { SITE } from "@/lib/constants";
import { localizedPath } from "@/lib/seo";
import { getAllServices, getAllLocations, getAllVehicles } from "@/lib/public/cms-content";
import { getSiteContact } from "@/lib/public/site-contact";

// Same revalidation window as the sitemap: the lists below come from the CMS,
// so a service or vehicle added in the admin panel appears here within an hour.
export const revalidate = 3600;

/**
 * /llms.txt — a plain-text map of the site for AI assistants and answer
 * engines (the llms.txt convention: an H1, a one-line summary in a blockquote,
 * then link lists). Every name, link and contact value is read from the same
 * public content layer the pages use, so it cannot drift from the site, and it
 * contains no claims beyond what the site itself publishes.
 *
 * English-only on purpose: it is an index, and the English URLs are the
 * canonical ones (`x-default` in the hreflang set).
 */
export async function GET() {
  const locale = "en" as const;
  const [services, locations, vehicles, contact] = await Promise.all([
    getAllServices(locale),
    getAllLocations(locale),
    getAllVehicles(locale),
    getSiteContact(),
  ]);

  const url = (path: string) => `${SITE.url}${localizedPath(locale, path)}`;
  const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
  const link = (name: string, path: string, description?: string) =>
    `- [${name}](${url(path)})${description ? `: ${oneLine(description)}` : ""}`;

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "A chauffeur-driven car service in Dubai, UAE. It is a service-area business: chauffeurs travel to the client and there is no public office or street address.",
    "",
    "## Services",
    ...services.map((s) => link(s.name, `/services/${s.slug}`, s.shortDescription)),
    "",
    "## Areas served",
    ...locations.map((l) => link(l.name, `/locations/${l.slug}`, l.shortDescription)),
    "",
    "## Fleet",
    link("Full fleet", "/fleet"),
    ...vehicles.map((v) => link(v.name, `/fleet/${v.slug}`)),
    "",
    "## Booking and contact",
    link("Book a chauffeur", "/booking"),
    link("Get a quote", "/quote"),
    link("Contact", "/contact"),
    link("FAQs", "/faqs"),
    `- Phone / WhatsApp: ${contact.phone}`,
    `- Email: ${contact.email}`,
    "",
    "## Optional",
    link("About us", "/about"),
    link("Blog", "/blog"),
    link("Privacy policy", "/privacy-policy"),
    link("Terms and conditions", "/terms"),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
