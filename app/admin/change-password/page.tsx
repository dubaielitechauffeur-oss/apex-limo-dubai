import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import AdminTopBar from "@/components/admin/AdminTopBar";
import ChangePasswordForm from "@/components/admin/auth/ChangePasswordForm";

export const metadata: Metadata = { title: "Change Password — Admin" };

export default async function ChangePasswordPage() {
  const user = await requireUser();

  return (
    <>
      <AdminTopBar name={user.name ?? "Admin"} email={user.email ?? ""} />
      <main className="flex justify-center px-4 py-16">
        <div className="w-full max-w-md border border-gold/20 bg-charcoal p-8 shadow-gold-lg">
          <h1 className="font-display text-2xl text-heading">Change Password</h1>
          <p className="mt-2 text-sm text-smoke">Update the password for your admin account.</p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}
