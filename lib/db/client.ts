import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * `pg` defaults to 10 connections per pool. On a serverless host every warm
 * instance holds its own pool, so a burst of concurrent invocations multiplies
 * that by the instance count and exhausts Postgres's `max_connections` — the
 * database starts refusing connections while the app looks healthy.
 *
 * A small per-instance ceiling is the right shape here: each request does a
 * handful of short queries, so a few connections saturate an instance's own
 * concurrency anyway, and capping them keeps total usage proportional to
 * instances rather than to traffic. `DATABASE_POOL_MAX` allows tuning per
 * environment (a long-running container can afford more than a lambda).
 *
 * `idleTimeoutMillis` returns connections promptly so a scaled-down instance
 * stops holding server-side sessions open.
 */
const DEFAULT_POOL_MAX = 5;

function createPrismaClient(): PrismaClient {
  const configuredMax = Number(process.env.DATABASE_POOL_MAX);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : DEFAULT_POOL_MAX,
    idleTimeoutMillis: 10_000,
    // Fail fast rather than queueing behind an exhausted pool forever; a
    // request that cannot get a connection should surface as an error the
    // fallback layer can catch, not as a hung page.
    connectionTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
