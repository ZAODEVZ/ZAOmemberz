import { NextRequest, NextResponse } from "next/server";
import {
  getProfileByWallet,
  toPublicProfile,
  updateProfile,
  cacheEns,
} from "@/lib/profiles";
import { resolveEns } from "@/lib/ens";
import { isAddress } from "viem";
import { profileWritableSchema } from "@/lib/validation";
import { getWriter, canWriteProfile } from "@/lib/auth/authorize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/profiles/:wallet   (PUBLIC — no auth)
 *
 * Returns the profile anchored to a wallet address. By default returns the
 * cached ENS name (flagged, with its resolved-at timestamp). Pass `?ens=live`
 * to force a fresh mainnet resolution (and refresh the cache).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  const { wallet } = await params;
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const profile = await getProfileByWallet(wallet);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pub = toPublicProfile(profile);

  if (req.nextUrl.searchParams.get("ens") === "live") {
    const live = await resolveEns(profile.walletAddress);
    // Best-effort cache refresh; don't block the response on it failing.
    cacheEns(profile.id, live.name, new Date(live.checkedAt)).catch(() => {});
    return NextResponse.json({
      profile: {
        ...pub,
        ens: { name: live.name, cached: false, checkedAt: live.checkedAt },
      },
    });
  }

  return NextResponse.json({ profile: pub });
}

/**
 * PATCH /api/profiles/:wallet   (GATED — owner session or API key)
 *
 * Updates an existing profile. Only the profile owner (matching wallet or FID)
 * or a valid API key may write.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  const { wallet } = await params;
  if (!isAddress(wallet)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const writer = await getWriter(req);
  if (!writer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByWallet(wallet);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canWriteProfile(writer, profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileWritableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const updated = await updateProfile(profile.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ profile: toPublicProfile(updated) });
}
