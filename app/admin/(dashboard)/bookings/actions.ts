"use server";

import { revalidatePath } from "next/cache";
import { setBookingStatus, setBookingNotes, softDeleteBooking, restoreBooking } from "@/lib/admin/bookings";
import type { BookingStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function setBookingStatusAction(id: string, status: BookingStatus): Promise<CmsActionState> {
  const result = await setBookingStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin");
  return { success: `Status changed to ${status.replace(/_/g, " ")}.` };
}

export async function setBookingNotesAction(id: string, notes: string): Promise<CmsActionState> {
  const result = await setBookingNotes(id, notes);
  if (!result.success) return { error: result.error };
  revalidatePath(`/admin/bookings/${id}`);
  return { success: "Notes saved." };
}

export async function deleteBookingAction(id: string): Promise<CmsActionState> {
  const result = await softDeleteBooking(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: "Booking deleted." };
}

export async function restoreBookingAction(id: string): Promise<CmsActionState> {
  const result = await restoreBooking(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin");
  return { success: "Booking restored." };
}
