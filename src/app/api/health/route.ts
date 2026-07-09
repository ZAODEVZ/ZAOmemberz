import { NextResponse } from "next/server";
import { db, profiles } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health
 * Lightweight liveness/readiness probe. Reports whether the database is
 * reachable. Returns 200 when healthy, 503 when the DB can't be reached.
 */
export async function GET() {
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(profiles);
    return NextResponse.json({
      status: "ok",
      db: "connected",
      profiles: row?.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "unreachable" },
      { status: 503 },
    );
  }
}
