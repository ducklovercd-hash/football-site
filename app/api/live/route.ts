import { NextResponse } from "next/server";
import { getLiveData } from "@/lib/data/live";

/**
 * Live scores endpoint polled by <LiveBoard/>.
 *
 * Serves matches fetched from FotMob server-side; the browser never talks to
 * an upstream API, so viewer traffic cannot burn provider quota. The inner
 * fetches go through the Next Data Cache, so 10,000 viewers still cost at
 * most one upstream request per revalidation window, and an idle site makes
 * zero upstream requests.
 *
 * When FotMob is unreachable the route degrades to the committed snapshot
 * (or demo fixtures) and says so in `source`.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const live = await getLiveData();
  const matches = live.matches.filter(
    (m) => m.status === "LIVE" || m.status === "HT",
  );

  return NextResponse.json(
    {
      matches,
      updatedAt: live.updatedAt,
      source: live.source,
      ...(live.reason ? { reason: live.reason } : {}),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
