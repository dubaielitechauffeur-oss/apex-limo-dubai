import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDefaultStorageProvider, getStorageConfigError } from "@/lib/media/storage";

/**
 * Guards the deployment shape that broke uploads in production: on Vercel
 * with no Blob store provisioned, the local disk driver was selected and
 * then threw EROFS from inside `fs.mkdir`, escaping the upload Server
 * Action and replacing the whole Media Library page with a generic error.
 * `getStorageConfigError()` is what turns that into an actionable message
 * before any work starts, so it is worth pinning to each combination.
 */

const ORIGINAL_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const ORIGINAL_VERCEL = process.env.VERCEL;

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

beforeEach(() => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL;
});

afterEach(() => {
  setEnv("BLOB_READ_WRITE_TOKEN", ORIGINAL_TOKEN);
  setEnv("VERCEL", ORIGINAL_VERCEL);
});

describe("getDefaultStorageProvider", () => {
  it("uses Vercel Blob (the `s3` slot) whenever a blob token is present", () => {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
    expect(getDefaultStorageProvider()).toBe("s3");
  });

  it("falls back to the local disk driver with no blob token", () => {
    expect(getDefaultStorageProvider()).toBe("local");
  });
});

describe("getStorageConfigError", () => {
  it("reports a problem on Vercel when no blob store is configured", () => {
    process.env.VERCEL = "1";
    const error = getStorageConfigError();
    expect(error).not.toBeNull();
    // The message has to name the fix, not just the symptom — an admin
    // reading it should know this is an ops step, not a bad file.
    expect(error).toMatch(/BLOB_READ_WRITE_TOKEN/);
    expect(error).toMatch(/Blob store/i);
  });

  it("reports no problem on Vercel once a blob store is configured", () => {
    process.env.VERCEL = "1";
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
    expect(getStorageConfigError()).toBeNull();
  });

  it("reports no problem off Vercel, where the local driver can write to disk", () => {
    // Covers `next dev` and any self-hosted node server — NODE_ENV is not
    // the signal here, a writable filesystem is.
    expect(getStorageConfigError()).toBeNull();
  });
});
