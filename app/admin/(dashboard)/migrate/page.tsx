"use client";

import { useState } from "react";

export default function MigratePage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<string>("");

  async function runMigration() {
    setStatus("running");
    setResult("");
    try {
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "x-migrate-secret": "apex-migrate-2026" },
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setResult(data.message + (data.errors?.length ? "\nErrors: " + data.errors.join(", ") : ""));
      } else {
        setStatus("error");
        setResult(data.error ?? "Unknown error");
      }
    } catch (e) {
      setStatus("error");
      setResult(String(e));
    }
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-2 text-2xl font-bold">Database Migration</h1>
      <p className="mb-6 text-sm text-gray-500">
        Imports all 13 vehicles from static data into the database. Safe to run multiple times — existing rows are skipped.
      </p>

      <button
        onClick={runMigration}
        disabled={status === "running"}
        className="w-full rounded-lg bg-amber-500 px-6 py-3 font-bold text-black disabled:opacity-50"
      >
        {status === "running" ? "Running... please wait" : "Run Migration"}
      </button>

      {status === "done" && (
        <div className="mt-4 rounded-lg border border-green-500 bg-green-50 p-4 text-green-800">
          ✅ {result}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 rounded-lg border border-red-500 bg-red-50 p-4 text-red-800">
          ❌ {result}
        </div>
      )}
    </div>
  );
}
