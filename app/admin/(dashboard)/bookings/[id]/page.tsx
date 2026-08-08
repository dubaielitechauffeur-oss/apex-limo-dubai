import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getBooking, getBookingAuditActivity, BOOKING_STATUS_TRANSITIONS } from "@/lib/admin/bookings";
import { setBookingStatusAction, setBookingNotesAction, deleteBookingAction, restoreBookingAction } from "@/app/admin/(dashboard)/bookings/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatusTransitionControl } from "@/components/admin/ui/StatusTransitionControl";
import { NotesEditor } from "@/components/admin/ui/NotesEditor";
import { DeleteRestoreControl } from "@/components/admin/ui/DeleteRestoreControl";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin/format";
import type { BookingStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Booking — Admin" };

const STATUS_LABELS: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.BOOKINGS_READ);
  const { id } = await params;

  const [result, auditResult] = await Promise.all([getBooking(id), getBookingAuditActivity(id)]);

  if (!result.success) {
    if (result.error === "Booking not found.") notFound();
    return (
      <div>
        <PageHeader title="Booking" breadcrumbs={[{ label: "Bookings", href: "/admin/bookings" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const booking = result.data;
  const canUpdate = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BOOKINGS_UPDATE);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.BOOKINGS_DELETE);
  const auditEntries = auditResult.success ? auditResult.data : [];

  return (
    <div>
      <PageHeader
        title={booking.reference}
        breadcrumbs={[{ label: "Bookings", href: "/admin/bookings" }, { label: booking.reference }]}
        actions={<StatusBadge label={booking.status.replace(/_/g, " ")} tone={STATUS_TONE[booking.status] ?? "neutral"} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-gray-500">Name</dt><dd className="text-gray-900">{booking.fullName}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{booking.email}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{booking.phone}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Journey</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-500">Pickup</dt><dd className="text-gray-900">{booking.pickupLocation}</dd></div>
              <div><dt className="text-gray-500">Drop-off</dt><dd className="text-gray-900">{booking.dropoffLocation}</dd></div>
              <div><dt className="text-gray-500">Date</dt><dd className="text-gray-900">{formatAdminDate(booking.date)}</dd></div>
              <div><dt className="text-gray-500">Time</dt><dd className="text-gray-900">{booking.time}</dd></div>
              <div><dt className="text-gray-500">Passengers</dt><dd className="text-gray-900">{booking.passengers}</dd></div>
              <div><dt className="text-gray-500">Duration</dt><dd className="text-gray-900">{booking.hours}</dd></div>
            </dl>
            {booking.specialRequests ? (
              <div className="mt-3">
                <dt className="text-sm text-gray-500">Special requests</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{booking.specialRequests}</dd>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Vehicle</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Requested</dt>
                <dd className="text-gray-900">
                  {booking.vehicle ? (
                    <Link href={`/admin/fleet/vehicles/${booking.vehicle.id}`} className="text-gray-900 hover:underline">
                      {booking.vehicleLabel}
                    </Link>
                  ) : (
                    booking.vehicleLabel
                  )}
                </dd>
              </div>
              <div><dt className="text-gray-500">Amount</dt><dd className="text-gray-900">{booking.totalAmount ? `${booking.totalAmount} ${booking.currency}` : "Not set"}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Internal Notes</h2>
            <p className="mt-1 text-xs text-gray-500">Never shown to the customer or on the public site.</p>
            <div className="mt-3">
              {canUpdate ? (
                <NotesEditor id={booking.id} initialValue={booking.internalNotes} onSave={setBookingNotesAction.bind(null, booking.id)} />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{booking.internalNotes || "No notes yet."}</p>
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
              <div><dt className="text-gray-500">Source</dt><dd className="text-gray-900 capitalize">{booking.source}</dd></div>
              <div><dt className="text-gray-500">Locale</dt><dd className="text-gray-900 uppercase">{booking.locale}</dd></div>
              <div><dt className="text-gray-500">Payment</dt><dd className="text-gray-900 capitalize">{booking.paymentStatus}</dd></div>
              <div><dt className="text-gray-500">Submitted</dt><dd className="text-gray-900">{formatAdminDateTime(booking.createdAt)}</dd></div>
            </dl>
          </section>

          {canUpdate ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Status</h2>
              <div className="mt-3">
                <StatusTransitionControl
                  id={booking.id}
                  status={booking.status}
                  allLabels={STATUS_LABELS}
                  allowedValues={BOOKING_STATUS_TRANSITIONS[booking.status]}
                  onUpdate={setBookingStatusAction.bind(null, booking.id)}
                />
              </div>
            </section>
          ) : null}

          {canDelete ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-3">
                <DeleteRestoreControl
                  isDeleted={Boolean(booking.deletedAt)}
                  listHref="/admin/bookings"
                  deleteTitle="Delete this booking?"
                  deleteDescription="This soft-deletes the booking — it's removed from the admin list and can be restored later."
                  onDelete={deleteBookingAction.bind(null, booking.id)}
                  onRestore={restoreBookingAction.bind(null, booking.id)}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
