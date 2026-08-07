import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import AdminTopBar from "@/components/admin/AdminTopBar";

export const metadata: Metadata = { title: "Admin — Apex Limo & Chauffeur Dubai" };

/**
 * Placeholder landing page behind the auth gate — proves the protected-route
 * flow works end to end (middleware redirect, session read, sign-out) without
 * building the dashboard/CMS itself, which is out of scope for this phase.
 */
export default async function AdminHomePage() {
  const user = await requireUser();

  return (
    <>
      <AdminTopBar name={user.name ?? "Admin"} email={user.email ?? ""} />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-3xl text-heading">Welcome, {user.name}.</h1>
        <p className="mt-3 max-w-xl text-smoke">
          You are signed in to the Apex Limo &amp; Chauffeur Dubai admin panel. Dashboard, fleet, booking, and
          content management modules ship in a later phase — this phase covers authentication only.
        </p>
      </main>
    </>
  );
}
