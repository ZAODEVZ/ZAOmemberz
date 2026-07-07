import { NextRequest, NextResponse } from "next/server";
import { getProfileByFid, toPublicProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/profiles/fid/:fid   (PUBLIC — no auth)
 * Returns the profile with the given Farcaster FID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fid: string }> },
) {
  const { fid } = await params;
  const n = Number(fid);
  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json({ error: "Invalid fid" }, { status: 400 });
  }

  const profile = await getProfileByFid(n);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ profile: toPublicProfile(profile) });
}
