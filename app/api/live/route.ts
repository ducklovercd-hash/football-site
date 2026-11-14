import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/data/matches";

/**
 * Live scores endpoint polled by <LiveBoard/>.
 *
 * DEMO MODE: computed locally, so it is cheap and uncached.
 *
 * When the real provider is wired in, this becomes the single choke point
 * that protects the API quota:
 *
 *   export const revalidate = 30;
 *   ...
 *   headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" }
 *
 * With that in place every viewer shares one upstream call per 30s window,
 * instead of one call per viewer.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  return NextResponse.json(
    {
      matches: getLiveMatches(now),
      updatedAt: now.toISOString(),
      source: "demo",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
