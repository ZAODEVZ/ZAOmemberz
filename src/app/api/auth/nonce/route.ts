import { NextResponse } from "next/server";
import { issueNonce } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/nonce
 * Issues a fresh nonce (also stored in a short-lived httpOnly cookie) that the
 * client embeds into the SIWE / SIWF message it asks the user to sign.
 */
export async function GET() {
  const nonce = await issueNonce();
  return NextResponse.json({ nonce });
}
