import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Returns the current authenticated session (wallet / fid / method) or null.
 * Used by the client to decide whether to show the editor or the login screen.
 */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
