import { NextRequest, NextResponse } from "next/server";
import { verifySiwf } from "@/lib/auth/siwf";
import {
  createSession,
  readNonce,
  clearNonce,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/auth/farcaster
 * Body: { message: string, signature: `0x...` }
 * Verifies a Sign-In-With-Farcaster message (primary end-user login) against
 * the Farcaster ID Registry on Optimism. On success, establishes a session
 * carrying the FID and the wallet the signature resolves to.
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

  const result = await verifySiwf(
    message,
    signature as `0x${string}`,
    expectedNonce,
  );
  if (!result.ok || !result.fid) {
    return NextResponse.json(
      { error: result.error ?? "Verification failed" },
      { status: 401 },
    );
  }

  // A SIWF login must resolve to a wallet to anchor the profile. Farcaster
  // returns the custody/verified address that produced the signature.
  if (!result.address) {
    return NextResponse.json(
      {
        error:
          "Farcaster login did not resolve to a wallet address. Use wallet sign-in instead.",
      },
      { status: 422 },
    );
  }

  await clearNonce();
  await createSession({
    wallet: result.address,
    fid: result.fid,
    method: "siwf",
  });

  return NextResponse.json({
    ok: true,
    fid: result.fid,
    wallet: result.address,
  });
}
