export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  vehicle: string;
  passengers: number;
  hours: string;
  specialRequests: string;
}

export interface QuoteFormData {
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  pickupLocation: string;
  date: string;
  vehicle: string;
  message: string;
}

export type LeadType = "booking" | "quote";

export interface LeadSubmissionResult {
  success: boolean;
  message: string;
  reference?: string;
}
