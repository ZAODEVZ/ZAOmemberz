import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { sessionSecret } from "@/lib/env";
import type { Session } from "./session-types";

export type { Session };

const COOKIE_NAME = "zaomz_session";
const NONCE_COOKIE = "zaomz_nonce";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Issue a signed session cookie. */
export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Read + verify the current session, or null if none/invalid/expired. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const wallet = typeof payload.wallet === "string" ? payload.wallet : null;
    const method = payload.method === "siwf" ? "siwf" : "siwe";
    if (!wallet) return null;
    return {
      wallet: wallet.toLowerCase(),
      fid: typeof payload.fid === "number" ? payload.fid : undefined,
      method,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

// ── Nonce handling (shared by SIWE and SIWF) ────────────────────────────────
// We store the issued nonce in a short-lived httpOnly cookie and require the
// signed message to carry the same nonce. This binds the signature to a value
// we generated, preventing replay of a captured signature.

export async function issueNonce(): Promise<string> {
  // 16 random bytes, hex — alphanumeric as required by the SIWE grammar.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const jar = await cookies();
  jar.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes to complete sign-in
  });
  return nonce;
}

export async function readNonce(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(NONCE_COOKIE)?.value ?? null;
}

export async function clearNonce(): Promise<void> {
  const jar = await cookies();
  jar.delete(NONCE_COOKIE);
}
