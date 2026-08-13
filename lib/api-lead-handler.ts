import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import type { BookingFormData, QuoteFormData, ContactFormData } from "@/lib/types";

/** Shared helpers for the booking/quote/contact API routes — previously
 *  duplicated near-verbatim across each `route.ts`. */

export function resolveLocale(value: unknown): Locale {
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

/** Generous enough for the longest legitimate lead payload (every field
 *  filled at lib/validation.ts's own MAX_MESSAGE_LENGTH) with headroom,
 *  while still rejecting the multi-megabyte bodies a naive `request.json()`
 *  would otherwise fully buffer and parse before validation ever runs. */
export const MAX_BODY_BYTES = 20_000;

export type ParsedBodyResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; reason: "too_large" | "invalid_json" };

/**
 * Reads and JSON-parses a request body without ever buffering more than
 * `maxBytes`. A `Content-Length` header is checked first as a fast path,
 * but — since that header is client-supplied and not authoritative — the
 * stream itself is also read incrementally and aborted the moment the
 * cap is crossed, so a spoofed/missing Content-Length or a chunked
 * transfer can't bypass the limit. Plain `await request.json()` has no
 * such guard and will fully buffer/parse an arbitrarily large body before
 * any validation logic gets a chance to reject it.
 */
export async function readJsonBodyWithLimit(
  request: NextRequest,
  maxBytes: number = MAX_BODY_BYTES
): Promise<ParsedBodyResult> {
  const declaredLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return { ok: false, reason: "invalid_json" };
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  }

  try {
    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array())
    );
    const data = JSON.parse(text || "{}");
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { ok: false, reason: "invalid_json" };
    }
    return { ok: true, data: data as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}

/** e.g. generateReference("APX-") -> "APX-L8K3J2A1-F9Q2", generateReference("APX-Q-") -> "APX-Q-L8K3J2A1-F9Q2" */
export function generateReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${stamp}-${rand}`;
}

/** Best-effort link to the `Vehicle` CMS row a lead's free-text vehicle
 *  label refers to (booking/quote forms still submit `Vehicle.name`, not a
 *  slug — see data/fleet.ts). Not unique in the schema, so `findFirst`; a
 *  miss (no match, or the vehicle was renamed/removed since) leaves the FK
 *  null — `vehicleLabel` is always stored regardless and remains the
 *  historical source of truth for what the customer saw and picked. */
async function resolveVehicleId(vehicleName: string): Promise<string | null> {
  if (!vehicleName) return null;
  const vehicle = await prisma.vehicle.findFirst({ where: { name: vehicleName, deletedAt: null }, select: { id: true } });
  return vehicle?.id ?? null;
}

export interface LeadPersistContext {
  reference: string;
  locale: Locale;
  ipAddress: string | null;
}

export interface PersistedLead {
  id: string;
  reference: string;
}

/**
 * Writes a public booking submission into the `Booking` table — the
 * admin Bookings CMS (Phase 10) reads from this table, not from the
 * outbound email. Called alongside (not instead of) `dispatchLead`'s
 * existing best-effort email/WhatsApp/CRM dispatch.
 *
 * Deliberately never throws: a persistence failure is logged and `null` is
 * returned, exactly matching this file's existing tolerance for downstream
 * failures ("the lead is still considered received" — see the booking/quote
 * route handlers) — a transient database hiccup must never turn into a
 * failed submission for the customer, who already has their reference and
 * confirmation regardless of whether this write succeeds. A reference
 * collision (astronomically unlikely — millisecond timestamp + 4 random
 * base-36 characters) is treated the same way: logged, not retried, since a
 * retry would risk the stored row's reference diverging from the one
 * already shown to the customer and put in their email.
 */
export async function persistBooking(data: BookingFormData, context: LeadPersistContext): Promise<PersistedLead | null> {
  try {
    const vehicleId = await resolveVehicleId(data.vehicle);
    const row = await prisma.booking.create({
      data: {
        reference: context.reference,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        date: new Date(data.date),
        time: data.time,
        vehicleId,
        vehicleLabel: data.vehicle,
        passengers: data.passengers,
        hours: data.hours,
        specialRequests: data.specialRequests,
        locale: context.locale,
        ipAddress: context.ipAddress ?? undefined,
      },
      select: { id: true, reference: true },
    });
    return row;
  } catch (err) {
    console.error("[api-lead-handler] failed to persist booking:", err);
    return null;
  }
}

/**
 * Writes a public quote submission into the `Quote` table. The public quote
 * form's fields (`serviceType`, `message`) don't map 1:1 onto `Quote`'s
 * columns (`dropoffLocation`/`time`/`hours`/`passengers` aren't collected by
 * the form at all, and `date` is optional there but required on the model)
 * — deliberately not changing the public form to collect them (see
 * BOOKING_QUOTE_CMS.md). Instead:
 * - `serviceType` and any "no date given" note are folded into
 *   `specialRequests` as readable context for the admin, alongside the
 *   customer's free-text `message`.
 * - `dropoffLocation`/`time`/`hours` default to `""`, `passengers` to `1` —
 *   these are true unknowns until an admin follows up, not lost data.
 * - `date` defaults to the submission date when the customer left it blank
 *   ("flexible, no specific date"), which the folded-in note makes explicit
 *   rather than letting the admin misread it as a firm request for today.
 */
/**
 * Writes a public contact submission into the `ContactSubmission` table —
 * the admin Contacts module reads from this table. Same silent-fail
 * pattern as `persistBooking`/`persistQuote`: never throws, returns null
 * on failure — the customer already has their reference and confirmation
 * regardless of whether this write succeeds.
 */
export async function persistContact(data: ContactFormData, context: LeadPersistContext): Promise<PersistedLead | null> {
  try {
    const row = await prisma.contactSubmission.create({
      data: {
        reference: context.reference,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        locale: context.locale,
        ipAddress: context.ipAddress ?? undefined,
      },
      select: { id: true, reference: true },
    });
    return row;
  } catch (err) {
    console.error("[api-lead-handler] failed to persist contact submission:", err);
    return null;
  }
}

export async function persistQuote(data: QuoteFormData, context: LeadPersistContext): Promise<PersistedLead | null> {
  try {
    const vehicleId = await resolveVehicleId(data.vehicle);
    const contextNotes: string[] = [];
    if (data.serviceType) contextNotes.push(`Service requested: ${data.serviceType}.`);
    if (!data.date) contextNotes.push("No specific date requested (flexible).");
    if (data.message?.trim()) contextNotes.push(data.message.trim());

    const row = await prisma.quote.create({
      data: {
        reference: context.reference,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        pickupLocation: data.pickupLocation,
        dropoffLocation: "",
        date: data.date ? new Date(data.date) : new Date(),
        time: "",
        vehicleId,
        vehicleLabel: data.vehicle,
        passengers: 1,
        hours: "",
        specialRequests: contextNotes.join(" "),
        locale: context.locale,
        ipAddress: context.ipAddress ?? undefined,
      },
      select: { id: true, reference: true },
    });
    return row;
  } catch (err) {
    console.error("[api-lead-handler] failed to persist quote:", err);
    return null;
  }
}
