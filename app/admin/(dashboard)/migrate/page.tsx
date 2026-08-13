import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthzContext, isSuperAdmin } from "@/lib/permissions/context";
import { MigrateClient } from "./MigrateClient";

export const metadata: Metadata = { title: "Migration — Admin" };

export default async function MigratePage() {
  const ctx = await getAuthzContext();
  if (!ctx) redirect("/admin/login");
  if (!isSuperAdmin(ctx)) redirect("/admin/forbidden");

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-2 text-2xl font-bold">Database Migration</h1>
      <p className="mb-6 text-sm text-gray-500">
        One-time fleet import from static data. Safe to run multiple times — existing rows are skipped. Requires MIGRATE_SECRET in environment.
      </p>
      <MigrateClient />
    </div>
  );
}
