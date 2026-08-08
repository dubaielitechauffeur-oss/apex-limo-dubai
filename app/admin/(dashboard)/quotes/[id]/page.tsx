import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getQuote, getQuoteAuditActivity, QUOTE_STATUS_TRANSITIONS } from "@/lib/admin/quotes";
import { setQuoteStatusAction, setQuoteNotesAction, deleteQuoteAction, restoreQuoteAction } from "@/app/admin/(dashboard)/quotes/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatusTransitionControl } from "@/components/admin/ui/StatusTransitionControl";
import { NotesEditor } from "@/components/admin/ui/NotesEditor";
import { DeleteRestoreControl } from "@/components/admin/ui/DeleteRestoreControl";
import { QuoteAmountForm } from "@/components/admin/quotes/QuoteAmountForm";
import { ConvertToBookingButton } from "@/components/admin/quotes/ConvertToBookingButton";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { QuoteStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Quote — Admin" };

const STATUS_LABELS: { value: QuoteStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "converted", label: "Converted" },
];

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  sent: "info",
  viewed: "info",
  accepted: "success",
  rejected: "danger",
  expired: "neutral",
  converted: "success",
};

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.QUOTES_READ);
  const { id } = await params;

  const [result, auditResult] = await Promise.all([getQuote(id), getQuoteAuditActivity(id)]);

  if (!result.success) {
    if (result.error === "Quote not found.") notFound();
    return (
      <div>
        <PageHeader title="Quote" breadcrumbs={[{ label: "Quotes", href: "/admin/quotes" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const quote = result.data;
  const canUpdate = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.QUOTES_UPDATE);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.QUOTES_DELETE);
  const canConvert = (isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.QUOTES_UPDATE)) && (isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BOOKINGS_CREATE));
  const auditEntries = auditResult.success ? auditResult.data : [];

  return (
    <div>
      <PageHeader
        title={quote.reference}
        breadcrumbs={[{ label: "Quotes", href: "/admin/quotes" }, { label: quote.reference }]}
        actions={<StatusBadge label={quote.status} tone={STATUS_TONE[quote.status] ?? "neutral"} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-gray-500">Name</dt><dd className="text-gray-900">{quote.fullName}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{quote.email}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{quote.phone}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Trip</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-500">Pickup</dt><dd className="text-gray-900">{quote.pickupLocation}</dd></div>
              <div><dt className="text-gray-500">Requested date</dt><dd className="text-gray-900">{formatAdminDate(quote.date)}</dd></div>
            </dl>
            {quote.specialRequests ? (
              <div className="mt-3">
                <dt className="text-sm text-gray-500">Details</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{quote.specialRequests}</dd>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Vehicle</h2>
            <dd className="mt-3 text-sm text-gray-900">
              {quote.vehicle ? (
                <Link href={`/admin/fleet/vehicles/${quote.vehicle.id}`} className="text-gray-900 hover:underline">
                  {quote.vehicleLabel}
                </Link>
              ) : (
                quote.vehicleLabel
              )}
            </dd>
          </section>

          {quote.convertedBookingId ? (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-sm font-semibold text-emerald-900">Converted</h2>
              <p className="mt-1 text-sm text-emerald-800">
                This quote was converted to{" "}
                <Link href={`/admin/bookings/${quote.convertedBookingId}`} className="font-medium underline">
                  a booking
                </Link>
                .
              </p>
            </section>
          ) : null}

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Internal Notes</h2>
            <p className="mt-1 text-xs text-gray-500">Never shown to the customer or on the public site.</p>
            <div className="mt-3">
              {canUpdate ? (
                <NotesEditor id={quote.id} initialValue={quote.internalNotes} onSave={setQuoteNotesAction.bind(null, quote.id)} />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{quote.internalNotes || "No notes yet."}</p>
              )}
            </div>
          </section>

          {auditEntries.length > 0 ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {auditEntries.map((entry) => (
                  <li key={entry.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-700">
                      <span className="font-medium capitalize">{entry.action}</span> by {entry.userName}
                    </span>
                    <span className="text-gray-400">{formatAdminDateTime(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Meta</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-gray-500">Source</dt><dd className="text-gray-900 capitalize">{quote.source}</dd></div>
              <div><dt className="text-gray-500">Locale</dt><dd className="text-gray-900 uppercase">{quote.locale}</dd></div>
              <div><dt className="text-gray-500">Submitted</dt><dd className="text-gray-900">{formatAdminDateTime(quote.createdAt)}</dd></div>
            </dl>
          </section>

          {canUpdate ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Quote Amount</h2>
              <div className="mt-3">
                <QuoteAmountForm id={quote.id} estimatedAmount={quote.estimatedAmount} currency={quote.currency} />
              </div>
            </section>
          ) : null}

          {canUpdate ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Status</h2>
              <div className="mt-3">
                <StatusTransitionControl
                  id={quote.id}
                  status={quote.status}
                  allLabels={STATUS_LABELS}
                  allowedValues={QUOTE_STATUS_TRANSITIONS[quote.status]}
                  onUpdate={setQuoteStatusAction.bind(null, quote.id)}
                />
              </div>
            </section>
          ) : null}

          {canConvert && quote.status === "accepted" && !quote.convertedBookingId ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Convert</h2>
              <p className="mt-1 text-xs text-gray-500">Once accepted, turn this quote into a real booking.</p>
              <div className="mt-3">
                <ConvertToBookingButton quoteId={quote.id} />
              </div>
            </section>
          ) : null}

          {canDelete ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-3">
                <DeleteRestoreControl
                  isDeleted={Boolean(quote.deletedAt)}
                  listHref="/admin/quotes"
                  deleteTitle="Delete this quote?"
                  deleteDescription="This soft-deletes the quote — it's removed from the admin list and can be restored later."
                  onDelete={deleteQuoteAction.bind(null, quote.id)}
                  onRestore={restoreQuoteAction.bind(null, quote.id)}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
