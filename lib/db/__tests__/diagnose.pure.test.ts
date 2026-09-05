import { describe, it, expect } from "vitest";
import { classifyDbError } from "@/lib/db/diagnose";

/**
 * Guards the classifier that decides what the admin login page and
 * /api/health/db tell an operator. Getting this wrong is not cosmetic: the
 * outage these tests are drawn from was reported as "the admin panel won't log
 * in", and the code's answer at the time — a generic "something went wrong",
 * then a confidently wrong "the server could not reach the database" — sent
 * the investigation to the connection settings and the pool, neither of which
 * was the problem.
 */
describe("classifyDbError", () => {
  it("recognises the production quota refusal, SQLSTATE and all", () => {
    // Reproduced from the live Vercel runtime log, including Prisma 7's shape:
    // a generic outer P2039 with the real SQLSTATE inside the message.
    const err = Object.assign(new Error(
      "Invalid `prisma.globalSettings.findFirst()` invocation:\n\n" +
      "Database error. Code: `53000`. Message: `Your project has exceeded the " +
      "data transfer quota. Upgrade your plan to increase limits.`"
    ), { code: "P2039" });

    // The embedded SQLSTATE is reported, not the uninformative outer code.
    expect(classifyDbError(err)).toEqual({ kind: "quota", code: "53000" });
  });

  it("still reports quota for a provider that words it differently", () => {
    const err = new Error("usage limit reached for this project");
    expect(classifyDbError(err).kind).toBe("quota");
  });

  it("separates a dead server from a refusing one", () => {
    expect(classifyDbError(Object.assign(new Error("x"), { code: "P1001" })).kind).toBe("unreachable");
    expect(classifyDbError(new Error("DatabaseNotReachable")).kind).toBe("unreachable");
    expect(classifyDbError(new Error("connect ECONNREFUSED 127.0.0.1:5432")).kind).toBe("unreachable");
  });

  it("names pool exhaustion as a timeout, not an outage", () => {
    // What `connectionTimeoutMillis` plus a small `max` produced — the pool
    // never handed out a connection, though the server was perfectly healthy.
    expect(classifyDbError(new Error("timeout exceeded when trying to connect")).kind).toBe("timeout");
  });

  it("points a missing table or column at migrations rather than the network", () => {
    expect(classifyDbError(Object.assign(new Error("x"), { code: "P2021" })).kind).toBe("schema");
    expect(classifyDbError(Object.assign(new Error("x"), { code: "P2022" })).kind).toBe("schema");
    expect(classifyDbError(new Error('relation "users" does not exist')).kind).toBe("schema");
  });

  it("distinguishes bad credentials from an unreachable host", () => {
    expect(classifyDbError(Object.assign(new Error("x"), { code: "P1000" })).kind).toBe("auth");
    expect(classifyDbError(new Error("password authentication failed for user")).kind).toBe("auth");
  });

  it("keeps too_many_connections as unreachable — nothing can connect", () => {
    const err = new Error("Database error. Code: `53300`. Message: `too many connections`");
    expect(classifyDbError(err)).toEqual({ kind: "unreachable", code: "53300" });
  });

  it("admits when it does not know, rather than guessing", () => {
    expect(classifyDbError(new Error("something else entirely"))).toEqual({ kind: "unknown", code: null });
    expect(classifyDbError(null).kind).toBe("unknown");
    expect(classifyDbError(undefined).kind).toBe("unknown");
  });
});
