import type { Timestamps, SoftDeletable } from "@/types/common";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingSource =
  | "website"
  | "whatsapp"
  | "phone"
  | "email"
  | "admin"
  | "crm";

export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";

export interface BookingEntity extends Timestamps, SoftDeletable {
  id: string;
  reference: string;
  status: BookingStatus;
  source: BookingSource;
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: Date;
  time: string;
  vehicleId: string;
  passengers: number;
  hours: string;
  specialRequests: string;
  totalAmount: number | null;
  currency: string;
  paymentStatus: PaymentStatus;
  driverId: string | null;
  assignedVehicleId: string | null;
  internalNotes: string;
}
