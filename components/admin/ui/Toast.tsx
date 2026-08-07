"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
interface ToastEntry {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

/** Minimal Context-based toast system — no new dependency, mounted once by
 *  the admin dashboard shell. Client components call `useToast()` after a
 *  Server Action resolves (Server Actions themselves can't render UI, so
 *  the calling client component is what decides success/error tone from
 *  the action's returned result). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = nextId++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastEntry; onDismiss: () => void }) {
  const ICONS: Record<ToastTone, typeof CheckCircle2> = { success: CheckCircle2, error: XCircle, info: Info };
  const COLORS: Record<ToastTone, string> = {
    success: "border-emerald-200 text-emerald-800",
    error: "border-red-200 text-red-800",
    info: "border-gray-200 text-gray-800",
  };
  const IconComponent = ICONS[toast.tone];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border bg-white px-4 py-3 shadow-lg ${COLORS[toast.tone]}`}
    >
      <IconComponent className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
