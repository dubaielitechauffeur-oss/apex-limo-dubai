import { describe, it, expect } from "vitest";
import {
  customerBookingEmailHtml,
  customerQuoteEmailHtml,
  customerContactEmailHtml,
  type CustomerEmailContact,
} from "@/lib/email-templates";
import type { BookingFormData, QuoteFormData, ContactFormData } from "@/lib/types";

/**
 * Covers the customer-facing confirmation emails (the ones the customer
 * receives after submitting a form), not the internal ops notifications.
 * The three things worth pinning down: user-submitted text is escaped
 * before it reaches the customer's inbox, the WhatsApp CTA points at the
 * live admin-editable number, and the wording never promises a confirmed
 * booking.
 */

const contact: CustomerEmailContact = {
  phone: "+971529426152",
  phoneDisplay: "+971 52 942 6152",
  whatsapp: "+971529426152",
  email: "bookings@apexchauffeurdubai.com",
};

const booking: BookingFormData = {
  fullName: "Aisha Khan",
  phone: "+971500000000",
  email: "aisha@example.com",
  pickupLocation: "DXB Terminal 3",
  dropoffLocation: "Palm Jumeirah",
  date: "2026-10-01",
  time: "14:30",
  vehicle: "Mercedes S-Class",
  passengers: 2,
  hours: "One-way",
  specialRequests: "Child seat",
};

const quote: QuoteFormData = {
  fullName: "Aisha Khan",
  phone: "+971500000000",
  email: "aisha@example.com",
  serviceType: "Airport Transfer",
  pickupLocation: "DXB Terminal 3",
  date: "2026-10-01",
  vehicle: "",
  message: "Return trip too",
};

const contactForm: ContactFormData = {
  fullName: "Aisha Khan",
  phone: "+971500000000",
  email: "aisha@example.com",
  subject: "Corporate account",
  message: "Please call me",
};

describe("customer confirmation emails", () => {
  it("includes the reference, trip details and WhatsApp button", () => {
    const html = customerBookingEmailHtml(booking, "APX-12345", contact);

    expect(html).toContain("APX-12345");
    expect(html).toContain("Palm Jumeirah");
    expect(html).toContain("Mercedes S-Class");
    expect(html).toContain("Chat with us on WhatsApp");
    // Deep link built from the admin-editable number, "+" stripped, with the
    // reference pre-filled so the customer doesn't have to repeat it.
    expect(html).toContain("https://wa.me/971529426152");
    expect(html).toContain("APX-12345");
    expect(html).toContain("tel:+971529426152");
  });

  it("does not tell the customer the booking is confirmed", () => {
    const html = customerBookingEmailHtml(booking, "APX-12345", contact).toLowerCase();

    expect(html).toContain("received your booking request");
    expect(html).not.toContain("booking confirmed");
    expect(html).not.toContain("your chauffeur is confirmed");
  });

  it("escapes user-submitted text", () => {
    const html = customerBookingEmailHtml(
      { ...booking, fullName: "<script>alert(1)</script>", specialRequests: 'a "quoted" & <b>bold</b>' },
      "APX-12345",
      contact
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("covers quote and contact submissions too", () => {
    const quoteHtml = customerQuoteEmailHtml(quote, "APX-Q-123", contact);
    expect(quoteHtml).toContain("APX-Q-123");
    expect(quoteHtml).toContain("Airport Transfer");
    // Empty vehicle falls back rather than rendering a blank row.
    expect(quoteHtml).toContain("No preference");
    expect(quoteHtml).toContain("Chat with us on WhatsApp");

    const contactHtml = customerContactEmailHtml(contactForm, "APX-C-123", contact);
    expect(contactHtml).toContain("APX-C-123");
    expect(contactHtml).toContain("Corporate account");
    expect(contactHtml).toContain("Please call me");
    expect(contactHtml).toContain("Chat with us on WhatsApp");
  });
});
