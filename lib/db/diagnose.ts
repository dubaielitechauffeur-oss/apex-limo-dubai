/**
 * Classifies a failed database call into the handful of causes that lead to
 * genuinely different fixes.
 *
 * Written after a live outage in which the admin panel reported only
 * "Something went wrong. Please try again." The first improvement on that —
 * "the server could not reach the database" — was better but still a guess:
 * it was applied to EVERY Prisma error, including ones where the connection
 * is perfectly healthy and it is the query that the database rejected. Those
 * two point at opposite fixes (check the host/credentials vs. run the pending
 * migrations), so the distinction is worth drawing properly.
 *
 * Nothing here is shown verbatim to a visitor. Prisma's own message embeds the
 * host, port and user from `DATABASE_URL`, which is exactly what must not
 * leave the server — so callers pass on the `kind` and, at most, the Prisma
 * error code, never `message`.
 */
export type DbFailureKind =
  /** No TCP connection: wrong host, DNS, firewall, or the server is down/paused. */
  | "unreachable"
  /** Reached it, but it refused us: bad password, wrong user, no access to the database. */
  | "auth"
  /** Reached it, but the query referenced a table or column it does not have —
   *  in practice, migrations that have not been applied to this environment. */
  | "schema"
  /** Reached it, or would have, but nothing answered in time — includes waiting
   *  for a free connection in an exhausted pool. */
  | "timeout"
  /** A database error that is none of the above. */
  | "unknown";

export interface DbFailure {
  kind: DbFailureKind;
  /** Prisma error code (P1001, P2022, …) where there is one. Safe to surface:
   *  it names the class of fault and carries no connection details. */
  code: string | null;
}

/** Prisma error codes, per https://www.prisma.io/docs/orm/reference/error-reference */
const CODE_KINDS: Record<string, DbFailureKind> = {
  P1000: "auth", // Authentication failed against the database server
  P1001: "unreachable", // Can't reach database server
  P1002: "timeout", // The database server was reached but timed out
  P1003: "schema", // Database (or schema) does not exist
  P1008: "timeout", // Operations timed out
  P1010: "auth", // User was denied access on the database
  P1011: "unreachable", // Error opening a TLS connection
  P1017: "unreachable", // Server has closed the connection
  P2021: "schema", // The table does not exist in the current database
  P2022: "schema", // The column does not exist in the current database
};

/** Postgres SQLSTATEs that `pg` reports directly, for the cases Prisma passes
 *  through as a raw driver error rather than mapping to a P-code. */
const SQLSTATE_KINDS: Record<string, DbFailureKind> = {
  "28P01": "auth", // invalid_password
  "28000": "auth", // invalid_authorization_specification
  "3D000": "schema", // invalid_catalog_name — database does not exist
  "42P01": "schema", // undefined_table
  "42703": "schema", // undefined_column
  "53300": "unreachable", // too_many_connections
  "57P01": "unreachable", // admin_shutdown
  "57P03": "unreachable", // cannot_connect_now — server still starting
};

function textOf(err: unknown): string {
  if (!err || typeof err !== "object") return String(err ?? "");
  const e = err as { message?: unknown; meta?: { driverAdapterError?: unknown }; cause?: unknown };
  const parts = [
    typeof e.message === "string" ? e.message : "",
    // Prisma 7's pg adapter reports the underlying fault here, with names like
    // `DatabaseNotReachable`, while the outer code is only a generic P2010.
    e.meta?.driverAdapterError ? String(e.meta.driverAdapterError) : "",
    e.cause ? String(e.cause) : "",
  ];
  return parts.join(" | ");
}

export function classifyDbError(err: unknown): DbFailure {
  const e = (err ?? {}) as { code?: unknown };
  const code = typeof e.code === "string" ? e.code : null;

  if (code && CODE_KINDS[code]) return { kind: CODE_KINDS[code], code };
  if (code && SQLSTATE_KINDS[code]) return { kind: SQLSTATE_KINDS[code], code };

  const text = textOf(err);
  // `pg`'s own pool exhaustion message. This is the failure mode a too-small
  // `max` combined with `connectionTimeoutMillis` produced — see lib/db/client.ts.
  if (/timeout exceeded when trying to connect|ETIMEDOUT|timed out/i.test(text)) {
    return { kind: "timeout", code };
  }
  if (/DatabaseNotReachable|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|Can't reach database server|Connection terminated|connection closed/i.test(text)) {
    return { kind: "unreachable", code };
  }
  if (/password authentication failed|authentication failed|permission denied for|role .* does not exist/i.test(text)) {
    return { kind: "auth", code };
  }
  if (/does not exist|relation .* does not exist|column .* does not exist/i.test(text)) {
    return { kind: "schema", code };
  }
  return { kind: "unknown", code };
}
