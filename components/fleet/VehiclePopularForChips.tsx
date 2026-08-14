import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PlainPopularForChip } from "@/data/fleet";

/**
 * Renders the admin-curated "Popular for [Service] in [Location]"
 * chips from `vehicle.popularFor`. Each label is a link to the
 * corresponding service or location page. Falls back to the
 * cross-links single-line render (below in the vehicle page) when
 * the admin hasn't set any explicit pairs.
 *
 * Kept as a small presentational component so mobile + desktop views
 * on the vehicle page can both use it without repeating markup.
 */
export function VehiclePopularForChips({
  chips,
  locale,
}: {
  chips: PlainPopularForChip[];
  locale: string;
}) {
  const t = useTranslations("fleet.detail");
  if (chips.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-smoke">
      {chips.map((chip, index) => (
        <li key={index} className="flex flex-wrap items-baseline gap-1">
          <span>{t("popularFor")}</span>
          {chip.serviceLabel && chip.serviceSlug ? (
            <Link
              href={`/${locale}/services/${chip.serviceSlug}`}
              className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
            >
              {chip.serviceLabel}
            </Link>
          ) : chip.serviceLabel ? (
            <span>{chip.serviceLabel}</span>
          ) : null}
          {chip.serviceLabel && chip.locationLabel ? <span>{t("inConnector")}</span> : null}
          {chip.locationLabel && chip.locationSlug ? (
            <Link
              href={`/${locale}/locations/${chip.locationSlug}`}
              className="text-gold underline underline-offset-4 transition-colors hover:text-gold-deep"
            >
              {chip.locationLabel}
            </Link>
          ) : chip.locationLabel ? (
            <span>{chip.locationLabel}</span>
          ) : null}
          <span>.</span>
        </li>
      ))}
    </ul>
  );
}
