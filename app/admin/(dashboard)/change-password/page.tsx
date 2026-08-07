import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import AdminChangePasswordForm from "@/components/admin/forms/AdminChangePasswordForm";

export const metadata: Metadata = { title: "Change Password — Admin" };

export default async function ChangePasswordPage() {
  await requireUser();

  return (
    <div>
      <PageHeader
        title="Change Password"
        subtitle="Update the password for your admin account."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Change Password" }]}
      />
      <AdminChangePasswordForm />
    </div>
  );
}
