import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/data/matches";
import { getSnapshot } from "@/lib/data/snapshot";

/**
 * Live scores endpoint polled by <LiveBoard/>.
 *
 * Serves the scraped snapshot when one exists, otherwise the local demo
 * fixtures. Either way the browser never talks to an upstream API, so viewer
 * traffic cannot consume a provider quota.
 *
 * The snapshot is fed by `npm run prepare:matches` (committed JSON) or by the
 * FOOTBALL_SNAPSHOT environment variable, so refreshing scores needs no code
 * change and no extra request path.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const snapshot = getSnapshot();
  const usingRealData = snapshot.matches.length > 0;

  return NextResponse.json(
    {
      matches: getLiveMatches(now),
      updatedAt: snapshot.generatedAt ?? now.toISOString(),
      source: usingRealData ? "sofascore-snapshot" : "demo",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
