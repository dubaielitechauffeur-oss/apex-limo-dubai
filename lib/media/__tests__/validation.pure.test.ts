import { describe, it, expect } from "vitest";
import { sniffImageMimeType, validateUpload, sanitizeOriginalFilename, MAX_UPLOAD_BYTES } from "@/lib/media/validation";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

function jpegHeader(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
}

function webpHeader(): Buffer {
  const buf = Buffer.alloc(16);
  buf.write("RIFF", 0, "ascii");
  buf.write("WEBP", 8, "ascii");
  return buf;
}

function avifHeader(): Buffer {
  // Minimal ftyp box: size(4) + "ftyp" + major brand "avif" + minor version(4) + compatible brand "mif1"
  const buf = Buffer.alloc(24);
  buf.writeUInt32BE(24, 0);
  buf.write("ftyp", 4, "ascii");
  buf.write("avif", 8, "ascii");
  buf.write("mif1", 16, "ascii");
  return buf;
}

describe("sniffImageMimeType — magic-byte detection, never trusts a claimed type", () => {
  it("detects PNG from its signature", () => {
    expect(sniffImageMimeType(PNG_1X1)).toBe("image/png");
  });

  it("detects JPEG from its signature", () => {
    expect(sniffImageMimeType(jpegHeader())).toBe("image/jpeg");
  });

  it("detects WebP from its RIFF/WEBP container", () => {
    expect(sniffImageMimeType(webpHeader())).toBe("image/webp");
  });

  it("detects AVIF from its ISOBMFF ftyp box", () => {
    expect(sniffImageMimeType(avifHeader())).toBe("image/avif");
  });

  it("returns null for arbitrary bytes claiming to be an image", () => {
    expect(sniffImageMimeType(Buffer.from("definitely not an image"))).toBeNull();
  });

  it("returns null for a RIFF container that isn't WEBP (e.g. a WAV file)", () => {
    const wav = Buffer.alloc(16);
    wav.write("RIFF", 0, "ascii");
    wav.write("WAVE", 8, "ascii");
    expect(sniffImageMimeType(wav)).toBeNull();
  });

  it("returns null for an empty buffer", () => {
    expect(sniffImageMimeType(Buffer.alloc(0))).toBeNull();
  });
});

describe("validateUpload", () => {
  it("accepts a real PNG", () => {
    const result = validateUpload(PNG_1X1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mimeType).toBe("image/png");
      expect(result.extension).toBe("png");
    }
  });

  it("rejects an empty file", () => {
    const result = validateUpload(Buffer.alloc(0));
    expect(result.ok).toBe(false);
  });

  it("rejects a file over the size limit even if its content is a valid PNG", () => {
    const oversized = Buffer.concat([PNG_1X1, Buffer.alloc(MAX_UPLOAD_BYTES)]);
    const result = validateUpload(oversized);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/too large/i);
  });

  it("rejects a .png-renamed text file — the extension is never trusted, only real bytes", () => {
    const fakeImage = Buffer.from("<html>not an image, just named image.png</html>");
    const result = validateUpload(fakeImage);
    expect(result.ok).toBe(false);
  });

  it("rejects SVG with a specific, documented reason rather than a generic error", () => {
    const svg = Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const result = validateUpload(svg);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/svg/i);
  });

  it("rejects a bare <svg ...> root without an XML prolog the same way", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
    const result = validateUpload(svg);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/svg/i);
  });
});

describe("sanitizeOriginalFilename", () => {
  it("strips path separators so the value can never be mistaken for a path", () => {
    expect(sanitizeOriginalFilename("../../etc/passwd")).not.toContain("/");
    expect(sanitizeOriginalFilename("..\\..\\windows\\system32")).not.toContain("\\");
  });

  it("strips control characters", () => {
    const bell = String.fromCharCode(7);
    const esc = String.fromCharCode(27);
    const withControlChars = "evil" + bell + "name" + esc + ".png";
    const cleaned = sanitizeOriginalFilename(withControlChars);
    expect(cleaned).toBe("evilname.png");
  });

  it("falls back to a safe default for a name that sanitizes to nothing", () => {
    expect(sanitizeOriginalFilename("")).toBe("upload");
    expect(sanitizeOriginalFilename("   ")).toBe("upload");
  });

  it("caps length at 200 characters", () => {
    const long = "a".repeat(500) + ".png";
    expect(sanitizeOriginalFilename(long).length).toBeLessThanOrEqual(200);
  });

  it("leaves an ordinary filename untouched", () => {
    expect(sanitizeOriginalFilename("mercedes-s-class-front.jpg")).toBe("mercedes-s-class-front.jpg");
  });
});
