import type { Metadata } from "next";
import AuthCard from "@/components/admin/auth/AuthCard";
import ForgotPasswordForm from "@/components/admin/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password — Admin" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
