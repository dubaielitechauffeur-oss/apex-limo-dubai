"use client";

import { useState } from "react";
import { runMigrationAction } from "./actions";

export function MigrateClient() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<string>("");

  async function runMigration() {
    setStatus("running");
    setResult("");
    const response = await runMigrationAction();
    if (response.success) {
      setStatus("done");
      setResult(response.message);
    } else {
      setStatus("error");
      setResult(response.error);
    }
  }

  return (
    <>
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
    </>
  );
}
