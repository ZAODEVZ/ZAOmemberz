import { NextRequest, NextResponse } from "next/server";
import { getProfileByDiscord, toPublicProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/profiles/discord/:discordId   (PUBLIC — no auth)
 * Returns the profile linked to a Discord user ID. Provided because consuming
 * apps (e.g. the ZAOOS Discord bot) join to this service by discord_id.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ discordId: string }> },
) {
  const { discordId } = await params;
  if (!/^\d{5,32}$/.test(discordId)) {
    return NextResponse.json({ error: "Invalid discord id" }, { status: 400 });
  }

  const profile = await getProfileByDiscord(discordId);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ profile: toPublicProfile(profile) });
}
