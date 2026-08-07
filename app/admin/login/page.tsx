import type { Metadata } from "next";
import AuthCard from "@/components/admin/auth/AuthCard";
import LoginForm from "@/components/admin/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In — Admin" };

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/admin") ? params.callbackUrl : "/admin";

  return (
    <AuthCard title="Sign In" subtitle="Enter your credentials to access the admin panel.">
      {params.reset === "success" ? (
        <p className="mb-5 border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Your password has been reset. Sign in with your new password.
        </p>
      ) : null}
      <LoginForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
