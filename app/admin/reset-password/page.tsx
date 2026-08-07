import type { Metadata } from "next";
import AuthCard from "@/components/admin/auth/AuthCard";
import ResetPasswordForm from "@/components/admin/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password — Admin" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthCard title="Reset Password" subtitle="Choose a new password for your admin account.">
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
