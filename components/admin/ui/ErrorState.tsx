import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
      <h3 className="mt-4 text-sm font-semibold text-red-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-red-700">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
