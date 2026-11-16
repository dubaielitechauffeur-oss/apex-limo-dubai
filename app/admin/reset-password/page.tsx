import type { Metadata } from "next";
import AuthCard from "@/components/admin/auth/AuthCard";
import ResetPasswordForm from "@/components/admin/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password — Admin" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; invite?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, invite } = await searchParams;
  // An invitation uses the same one-time-token form; only the wording differs.
  const isInvite = invite === "1";

  return (
    <AuthCard
      title={isInvite ? "Set Your Password" : "Reset Password"}
      subtitle={
        isInvite
          ? "Welcome. Choose a password to activate your admin account."
          : "Choose a new password for your admin account."
      }
    >
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
