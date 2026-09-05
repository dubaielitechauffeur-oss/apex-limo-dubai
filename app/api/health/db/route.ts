import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyDbError, type DbFailure } from "@/lib/db/diagnose";

/**
 * Is this deployment able to talk to its database?
 *
 * Exists because of a live outage that was diagnosable only from the platform's
 * runtime logs. Every visible symptom pointed somewhere else: the public pages
 * kept returning 200 (they fall back to the static `data/*.ts` copy by design,
 * so the only clue was that CMS-edited prices had quietly reverted to the
 * hardcoded ones), and the admin panel — the one place that surfaces the fault
 * — is exactly what you cannot get into when the database is down. This gives
 * one URL that answers the question directly.
 *
 * Unauthenticated on purpose: the audience is the site owner locked out of the
 * admin panel, and gating it behind the login that is failing would defeat it.
 *
 * What it discloses is deliberately minimal: whether the database answered, a
 * coarse failure kind, and Prisma's own error code. Never the error message —
 * Prisma embeds the host, port and user from `DATABASE_URL` in it, and that
 * must not leave the server. The rest is inferable anyway by anyone watching
 * the site misbehave.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** A probe cached this briefly costs the database nothing under repeated
 *  hits, so the endpoint cannot be used to add load to an already struggling
 *  server. Short enough that a human refreshing it still sees recovery. */
const CACHE_MS = 5_000;

interface Probe {
  at: number;
  ok: boolean;
  failure: DbFailure | null;
  latencyMs: number;
}
let cached: Probe | null = null;

async function probe(): Promise<Probe> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached;

  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    cached = { at: now, ok: true, failure: null, latencyMs: Date.now() - started };
  } catch (err) {
    const failure = classifyDbError(err);
    console.error(`[health] database probe failed (kind=${failure.kind}, code=${failure.code ?? "none"}):`, err);
    cached = { at: now, ok: false, failure, latencyMs: Date.now() - started };
  }
  return cached;
}

export async function GET() {
  const result = await probe();

  const body = result.ok
    ? { database: "ok" as const, latencyMs: result.latencyMs }
    : {
        database: result.failure?.kind ?? "unknown",
        code: result.failure?.code ?? null,
        latencyMs: result.latencyMs,
      };

  return NextResponse.json(body, {
    status: result.ok ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
