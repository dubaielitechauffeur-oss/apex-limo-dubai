import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Connection ceiling for this process's pool.
 *
 * An earlier version of this file set it to 5 AND added
 * `connectionTimeoutMillis: 10_000`, to stop warm serverless instances from
 * multiplying `pg`'s default of 10 into an exhausted `max_connections`. That
 * pairing was a mistake, and it took the site down in a way that looked like
 * a content bug rather than a database one:
 *
 *   - `connectionTimeoutMillis` bounds the WHOLE acquire, queue wait included,
 *     not just the TCP/TLS handshake. So under ordinary concurrency, requests
 *     waiting their turn for one of 5 connections started being rejected with
 *     "timeout exceeded when trying to connect" — measured here at 15 of 40
 *     concurrent 2s queries failing, where the previous settings completed all
 *     40 in 8s.
 *   - Every one of those rejections is an exception, and the public site
 *     catches exceptions by design (`withFallback` in lib/public/cms-content.ts)
 *     and serves the static `data/*.ts` copy instead. The page still returns
 *     200 — with the hardcoded rates rather than the ones an admin set in the
 *     CMS. That is what "the vehicle pricing changed by itself" was.
 *   - The admin panel has no such fallback, so the same failure surfaced there
 *     as a login that would not go through.
 *
 * The ceiling itself was not the problem and is kept, at `pg`'s own default:
 * the deployment ran on exactly this number before, so it is the known-good
 * value, and `DATABASE_POOL_MAX` remains available to lower it for an
 * environment whose database genuinely has a tight connection budget.
 *
 * The real fix for pool multiplication is the `globalForPrisma` cache at the
 * bottom of this file, which now applies in production too — one pool per
 * process instead of one per module instance.
 */
const DEFAULT_POOL_MAX = 10;

function createPrismaClient(): PrismaClient {
  const configuredMax = Number(process.env.DATABASE_POOL_MAX);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : DEFAULT_POOL_MAX,
    // Matches `pg`'s own default; stated explicitly so a scaled-down instance
    // is visibly meant to hand its server-side sessions back.
    idleTimeoutMillis: 10_000,
    // Deliberately NOT setting `connectionTimeoutMillis` — see above. An
    // unreachable host still fails immediately (ECONNREFUSED / DNS), which is
    // the case worth failing fast on; a busy pool waits instead of lying.
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

/**
 * Cached in every environment, not just development.
 *
 * In development this is the usual guard against HMR creating a new client on
 * each reload. In production it does something the dev-only version could not:
 * Next.js evaluates this module once per server bundle — Server Components,
 * route handlers and Server Actions can each get their own instance — so
 * without the cache a single process held several independent pools and the
 * `max` above meant several times what it said. That multiplication is the
 * problem the previous, too-small ceiling was trying to work around.
 */
globalForPrisma.prisma = prisma;
