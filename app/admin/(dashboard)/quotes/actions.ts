"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setQuoteStatus, setQuoteNotes, setQuoteAmount, softDeleteQuote, restoreQuote, convertQuoteToBooking } from "@/lib/admin/quotes";
import type { QuoteStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function setQuoteStatusAction(id: string, status: QuoteStatus): Promise<CmsActionState> {
  const result = await setQuoteStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  return { success: `Status changed to ${status.replace(/_/g, " ")}.` };
}

export async function setQuoteNotesAction(id: string, notes: string): Promise<CmsActionState> {
  const result = await setQuoteNotes(id, notes);
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/quotes/${id}`);
  return { success: "Notes saved." };
}

export async function setQuoteAmountAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const id = String(formData.get("id") ?? "");
  const rawAmount = String(formData.get("estimatedAmount") ?? "").trim();
  const currency = String(formData.get("currency") ?? "AED");
  const estimatedAmount = rawAmount === "" ? null : Number(rawAmount);

  const result = await setQuoteAmount(id, estimatedAmount, currency);
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/quotes/${id}`);
  return { success: "Quote amount saved." };
}

export async function deleteQuoteAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteQuote(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { success: "Quote deleted." };
}

export async function restoreQuoteAction(id: string): Promise<CmsActionState> {
  const result = await restoreQuote(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  return { success: "Quote restored." };
}

export async function convertQuoteToBookingAction(id: string): Promise<CmsActionState> {
  const result = await convertQuoteToBooking(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  redirect(`/admin/bookings/${result.data.bookingId}`);
}
