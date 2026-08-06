import type { Timestamps, SoftDeletable } from "@/types/common";

export type QuoteStatus =
  | "pending"
  | "sent"
  | "accepted"
  | "declined"
  | "expired"
  | "converted";

export interface QuoteEntity extends Timestamps, SoftDeletable {
  id: string;
  reference: string;
  status: QuoteStatus;
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  pickupLocation: string;
  date: Date | null;
  vehicle: string;
  message: string;
  quotedAmount: number | null;
  currency: string;
  validUntil: Date | null;
  convertedBookingId: string | null;
  internalNotes: string;
}
