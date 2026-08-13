import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getContact, getContactAuditActivity, CONTACT_STATUS_TRANSITIONS } from "@/lib/admin/contacts";
import { setContactStatusAction, deleteContactAction } from "@/app/admin/(dashboard)/contacts/actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatusTransitionControl } from "@/components/admin/ui/StatusTransitionControl";
import { DeleteRestoreControl } from "@/components/admin/ui/DeleteRestoreControl";
import { formatAdminDateTime } from "@/lib/admin/format";
import type { ContactSubmissionStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Contact Submission — Admin" };

const STATUS_LABELS: { value: ContactSubmissionStatus; label: string }[] = [
  { value: "new_submission", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const STATUS_TONE: Record<ContactSubmissionStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  new_submission: "warning",
  read: "info",
  replied: "success",
  archived: "neutral",
};

const STATUS_DISPLAY: Record<ContactSubmissionStatus, string> = {
  new_submission: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.CONTACTS_READ);
  const { id } = await params;

  const [result, auditResult] = await Promise.all([getContact(id), getContactAuditActivity(id)]);

  if (!result.success) {
    if (result.error === "Contact submission not found.") notFound();
    return (
      <div>
        <PageHeader title="Contact Submission" breadcrumbs={[{ label: "Contacts", href: "/admin/contacts" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const contact = result.data;
  const canUpdate = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.CONTACTS_UPDATE);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.CONTACTS_DELETE);
  const auditEntries = auditResult.success ? auditResult.data : [];

  const mailtoHref = `mailto:${contact.email}?subject=${encodeURIComponent("Re: " + contact.subject)}`;

  return (
    <div>
      <PageHeader
        title={contact.reference}
        breadcrumbs={[{ label: "Contacts", href: "/admin/contacts" }, { label: contact.reference }]}
        actions={<StatusBadge label={STATUS_DISPLAY[contact.status]} tone={STATUS_TONE[contact.status]} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Sender</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-gray-500">Name</dt><dd className="text-gray-900">{contact.fullName}</dd></div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">
                  <a href={mailtoHref} className="hover:underline">{contact.email}</a>
                </dd>
              </div>
              <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{contact.phone ?? "—"}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Subject</h2>
            <p className="mt-2 text-sm text-gray-900">{contact.subject}</p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{contact.message}</p>
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
              <div><dt className="text-gray-500">Locale</dt><dd className="text-gray-900 uppercase">{contact.locale}</dd></div>
              <div><dt className="text-gray-500">IP</dt><dd className="text-gray-900">{contact.ipAddress ?? "—"}</dd></div>
              <div><dt className="text-gray-500">Received</dt><dd className="text-gray-900">{formatAdminDateTime(contact.createdAt)}</dd></div>
            </dl>
          </section>

          {canUpdate ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Status</h2>
              <div className="mt-3">
                <StatusTransitionControl
                  id={contact.id}
                  status={contact.status}
                  allLabels={STATUS_LABELS}
                  allowedValues={CONTACT_STATUS_TRANSITIONS[contact.status]}
                  onUpdate={setContactStatusAction.bind(null, contact.id)}
                />
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Reply</h2>
            <p className="mt-1 text-xs text-gray-500">Opens your email client with the sender&apos;s address pre-filled.</p>
            <a
              href={mailtoHref}
              className="mt-3 inline-flex items-center justify-center rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              Reply via email
            </a>
          </section>

          {canDelete ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-3">
                <DeleteRestoreControl
                  isDeleted={false}
                  listHref="/admin/contacts"
                  deleteTitle="Delete this contact submission?"
                  deleteDescription="This is a hard delete — the submission cannot be recovered."
                  onDelete={deleteContactAction.bind(null, contact.id)}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
