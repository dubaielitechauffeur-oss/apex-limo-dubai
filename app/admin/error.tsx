"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the whole admin tree. Without it, any throw inside an
 * admin page (a failed query, a bad CMS payload) fell through to Next's
 * default unstyled error screen — which, on a signed-in admin's own tooling,
 * gives no way back other than the browser's back button.
 *
 * Sits at `app/admin` rather than inside the `(dashboard)` group so it also
 * covers the sign-in, forgot-password and reset-password routes.
 */
export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Something went wrong"
          description={
            error.digest
              ? `An unexpected error occurred. Reference ${error.digest} — quote this if you report it.`
              : "An unexpected error occurred while loading this screen."
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Try again
              </button>
              <Link
                href="/admin"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to dashboard
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
