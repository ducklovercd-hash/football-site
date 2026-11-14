import type { Match } from "@/lib/types";
import snapshot from "./generated/matches.json";

/**
 * Loads the scraped match snapshot.
 *
 * Two delivery paths, checked in order:
 *
 * 1. `FOOTBALL_SNAPSHOT` — the same JSON as a string. Lets you push fresh
 *    scores straight into Vercel (Project → Settings → Environment Variables)
 *    without a rebuild. Environment variables cap out at 64 KB on Vercel, so
 *    this only holds a small window of fixtures.
 *
 * 2. `generated/matches.json` — committed alongside the code by
 *    `npm run prepare:matches`. No size limit, refreshed on each deploy.
 *
 * Never throws: a malformed snapshot degrades to "no real data" so the site
 * falls back to demo matches instead of failing a build.
 */

export interface Snapshot {
  generatedAt: string | null;
  source: string | null;
  matches: Match[];
}

const EMPTY: Snapshot = { generatedAt: null, source: null, matches: [] };

function isSnapshot(value: unknown): value is Snapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Snapshot).matches)
  );
}

function fromEnv(): Snapshot | null {
  const raw = process.env.FOOTBALL_SNAPSHOT;
  if (!raw || raw.trim() === "") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isSnapshot(parsed)) return null;
    return parsed;
  } catch {
    console.warn("[snapshot] FOOTBALL_SNAPSHOT is not valid JSON — ignoring it");
    return null;
  }
}

let cached: Snapshot | null = null;

export function getSnapshot(): Snapshot {
  if (cached) return cached;

  const env = fromEnv();
  if (env && env.matches.length > 0) {
    cached = { ...env, source: "env:FOOTBALL_SNAPSHOT" };
    return cached;
  }

  if (isSnapshot(snapshot) && snapshot.matches.length > 0) {
    cached = snapshot;
    return cached;
  }

  cached = EMPTY;
  return cached;
}

/** True when real scraped data is being served instead of demo fixtures. */
export function hasRealData(): boolean {
  return getSnapshot().matches.length > 0;
}
