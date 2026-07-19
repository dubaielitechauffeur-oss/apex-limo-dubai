import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { FLEET } from "@/data/fleet";
import { SERVICES } from "@/data/services";
import { LOCATIONS } from "@/data/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/booking`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/quote`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/fleet`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/locations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/faqs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const fleetRoutes: MetadataRoute.Sitemap = FLEET.map((vehicle) => ({
    url: `${SITE.url}/fleet/${vehicle.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE.url}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const locationRoutes: MetadataRoute.Sitemap = LOCATIONS.map((location) => ({
    url: `${SITE.url}/locations/${location.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...fleetRoutes, ...serviceRoutes, ...locationRoutes];
}
