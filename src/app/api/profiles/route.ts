import { NextRequest, NextResponse } from "next/server";
import {
  createProfile,
  getProfileByWallet,
  toPublicProfile,
} from "@/lib/profiles";
import { profileCreateSchema } from "@/lib/validation";
import { getWriter, canCreateForWallet } from "@/lib/auth/authorize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/profiles   (GATED — owner session or API key)
 *
 * Creates a new profile anchored to `walletAddress`. A session may only create
 * a profile for its own wallet; an API key may create for any wallet
 * (server-side/admin seeding).
 */
export async function POST(req: NextRequest) {
  const writer = await getWriter(req);
  if (!writer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (!canCreateForWallet(writer, parsed.data.walletAddress)) {
    return NextResponse.json(
      { error: "You can only create a profile for your own wallet" },
      { status: 403 },
    );
  }

  const existing = await getProfileByWallet(parsed.data.walletAddress);
  if (existing) {
    return NextResponse.json(
      { error: "A profile already exists for this wallet" },
      { status: 409 },
    );
  }

  const created = await createProfile(parsed.data);
  return NextResponse.json(
    { profile: toPublicProfile(created) },
    { status: 201 },
  );
}
