import { describe, expect, it } from "vitest";
import {
  SERVICE_AREA_ADDRESS,
  breadcrumbJsonLd,
  organizationJsonLd,
  organizationReviewsJsonLd,
} from "@/lib/seo";

/**
 * Regression tests for the structured-data problems Search Console reported:
 *  - a LocalBusiness block with no `name`/`address` (the standalone review node),
 *  - `inLanguage` on types that do not define it (LocalBusiness, BreadcrumbList).
 * Google validates every JSON-LD block on its own, so each block has to be valid by itself.
 */
describe("structured-data validity", () => {
  it("the site-wide LocalBusiness node carries name + address and no inLanguage", () => {
    const node = organizationJsonLd("en") as Record<string, unknown>;
    expect(node.name).toBeTruthy();
    expect(node.address).toEqual(SERVICE_AREA_ADDRESS);
    expect(node).not.toHaveProperty("inLanguage");
  });

  it("the standalone review node is a complete LocalBusiness on its own", () => {
    const node = organizationReviewsJsonLd("en") as Record<string, unknown> | null;
    // null is legitimate when there are no testimonials to publish.
    if (node === null) return;
    expect(node["@type"]).toBe("LocalBusiness");
    expect(node.name).toBeTruthy();
    expect(node.address).toEqual(SERVICE_AREA_ADDRESS);
    expect(node).not.toHaveProperty("inLanguage");
    // Same @id as the site-wide node, so Google merges them into one entity.
    expect(node["@id"]).toBe((organizationJsonLd("en") as Record<string, unknown>)["@id"]);
  });

  it("never publishes a street address (the business is service-area only)", () => {
    expect(SERVICE_AREA_ADDRESS).not.toHaveProperty("streetAddress");
    expect(SERVICE_AREA_ADDRESS).not.toHaveProperty("postalCode");
  });

  it("BreadcrumbList has no inLanguage", () => {
    const node = breadcrumbJsonLd([{ name: "Services", path: "/services" }], "en", "Home") as Record<string, unknown>;
    expect(node["@type"]).toBe("BreadcrumbList");
    expect(node).not.toHaveProperty("inLanguage");
  });
});
