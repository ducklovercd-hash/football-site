import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/fotmob/fixtures";

/**
 * Deployment canary: confirms FotMob serves JSON to this host's egress IPs.
 * Useful whenever the deployed site silently falls back to snapshot data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchFixtures(new Date());
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      ok: true,
      fixtures: result.fixtures.length,
      firstLeague: result.fixtures[0]?.league?.name ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
