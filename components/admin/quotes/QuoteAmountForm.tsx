"use client";

import { useActionState, useEffect } from "react";
import { setQuoteAmountAction, type CmsActionState } from "@/app/admin/(dashboard)/quotes/actions";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";
import { useToast } from "@/components/admin/ui/Toast";

const initialState: CmsActionState = {};

export function QuoteAmountForm({ id, estimatedAmount, currency }: { id: string; estimatedAmount: string | null; currency: string }) {
  const [state, formAction, isPending] = useActionState(setQuoteAmountAction, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) showToast(state.success, "success");
    else if (state.error) showToast(state.error, "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <FormField id="estimatedAmount" label="Quote amount">
        <input id="estimatedAmount" name="estimatedAmount" type="number" min={0} step="0.01" defaultValue={estimatedAmount ?? ""} className={ADMIN_INPUT_CLASSES} />
      </FormField>
      <FormField id="currency" label="Currency">
        <input id="currency" name="currency" defaultValue={currency} className={ADMIN_INPUT_CLASSES} />
      </FormField>
      <button type="submit" disabled={isPending} className="rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
        {isPending ? "Saving…" : "Save amount"}
      </button>
    </form>
  );
}
