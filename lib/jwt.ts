import crypto from "node:crypto";

const SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "insecure-fallback-change-me";

function base64url(buf: Buffer | string): string {
  const s = typeof buf === "string" ? Buffer.from(buf) : buf;
  return s
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input: string): Buffer {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (s.length % 4)) % 4;
  return Buffer.from(s + "=".repeat(padLen), "base64");
}

export type MiniAppTokenPayload = {
  id: string;
  phone: string;
  iat?: number;
  exp?: number;
};

export function signMiniAppToken(
  payload: { id: string; phone: string },
  expiresInSeconds = 60 * 60 * 24 * 30
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const full: MiniAppTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(full));
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest();
  return `${h}.${p}.${base64url(sig)}`;
}

export function verifyMiniAppToken(
  token: string
): MiniAppTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;

  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(`${h}.${p}`)
    .digest();
  let actualSig: Buffer;
  try {
    actualSig = base64urlDecode(sig);
  } catch {
    return null;
  }
  if (
    expectedSig.length !== actualSig.length ||
    !crypto.timingSafeEqual(expectedSig, actualSig)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      base64urlDecode(p).toString("utf8")
    ) as MiniAppTokenPayload;
    if (
      typeof payload.id !== "string" ||
      typeof payload.phone !== "string"
    ) {
      return null;
    }
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
