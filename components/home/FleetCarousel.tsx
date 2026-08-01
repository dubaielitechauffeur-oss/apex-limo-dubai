import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAllVehicles } from "@/data/fleet";
import { FLEET_SIZE } from "@/lib/constants";
import FleetCarouselClient from "./FleetCarouselClient";

/**
 * Server wrapper for the homepage fleet carousel — localizes the fleet
 * data and translates the surrounding chrome here, then passes plain
 * props into the "use client" carousel (FleetCarouselClient). Keeps the
 * `data/fleet` module (which holds all 6 locales' worth of vehicle copy)
 * out of the client bundle entirely; only this one page's already-resolved
 * strings cross the server/client boundary.
 */
export default async function FleetCarousel() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("fleet.carousel");
  const tCard = await getTranslations("fleet.card");
  const vehicles = getAllVehicles(locale);

  // Resolved server-side (rather than passed as a function prop) — Server
  // Component props crossing into a Client Component must be plain
  // serializable data, never functions.
  const vehicleAriaLabels = Object.fromEntries(
    vehicles.map((vehicle) => [vehicle.slug, t("goToVehicleAriaLabel", { name: vehicle.name })])
  );

  return (
    <FleetCarouselClient
      vehicles={vehicles}
      cardLabels={{
        imageComingSoon: tCard("imageComingSoon"),
        tenHours: tCard("tenHours"),
        fiveHours: tCard("fiveHours"),
        oneHour: tCard("oneHour"),
        airport: tCard("airport"),
        viewCar: tCard("viewCar"),
        whatsapp: tCard("whatsapp"),
        contactUs: tCard("contactUs"),
        whatsappMessageTemplate: tCard("whatsappMessageTemplate"),
      }}
      eyebrow={t("eyebrow")}
      title={t("title")}
      subtitle={t("subtitleTemplate", { count: FLEET_SIZE })}
      ariaLabel={t("ariaLabel")}
      prevAriaLabel={t("prevAriaLabel")}
      nextAriaLabel={t("nextAriaLabel")}
      vehicleAriaLabels={vehicleAriaLabels}
      viewFullFleet={t("viewFullFleet")}
    />
  );
}
