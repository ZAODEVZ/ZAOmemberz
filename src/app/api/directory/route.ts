import { NextResponse } from "next/server";
import { listDirectory, toPublicProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/directory   (PUBLIC — no auth)
 * The full public member directory. Consuming apps use this to enrich their
 * own pages with ZAO profile info (display name / avatar / bio).
 */
export async function GET() {
  const profiles = await listDirectory();
  return NextResponse.json({
    count: profiles.length,
    profiles: profiles.map(toPublicProfile),
  });
}
