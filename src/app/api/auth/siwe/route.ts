import { NextRequest, NextResponse } from "next/server";
import { verifySiwe } from "@/lib/auth/siwe";
import {
  createSession,
  readNonce,
  clearNonce,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/siwe
 * Body: { message: string, signature: string }
 * Verifies a Sign-In-With-Ethereum signature (wallet fallback login) and, on
 * success, establishes a session anchored to the wallet.
 */
export async function POST(req: NextRequest) {
  let body: { message?: string; signature?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, signature } = body;
  if (!message || !signature) {
    return NextResponse.json(
      { error: "message and signature are required" },
      { status: 400 },
    );
  }

  const expectedNonce = await readNonce();
  if (!expectedNonce) {
    return NextResponse.json(
      { error: "No nonce issued or nonce expired. Request a new one." },
      { status: 400 },
    );
  }

  const result = await verifySiwe(message, signature, expectedNonce);
  if (!result.ok || !result.address) {
    return NextResponse.json(
      { error: result.error ?? "Verification failed" },
      { status: 401 },
    );
  }

  await clearNonce();
  await createSession({ wallet: result.address, method: "siwe" });

  return NextResponse.json({ ok: true, wallet: result.address });
}
