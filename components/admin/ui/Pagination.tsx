import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Server-rendered, link-based pagination — no client state needed since
 *  page number lives in the URL's search params (?page=n), which keeps
 *  filters/search shareable and back-button-friendly. */
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <PageLink href={buildHref(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </PageLink>
        <span className="px-3 text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
  "aria-label": string;
}) {
  const classes =
    "flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors";
  if (disabled) {
    return (
      <span className={`${classes} cursor-not-allowed opacity-40`} aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={`${classes} hover:bg-gray-50 hover:text-gray-900`}>
      {children}
    </Link>
  );
}
