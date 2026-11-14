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

/**
 * Coerces a scraped match into the shape the UI expects.
 *
 * The UI renders lineups as `{ formation, players }`. An older scraper build
 * (or a hand-edited snapshot) may still emit a flat array, which would crash
 * the formation grid. Rather than trust the producer, normalise here — the
 * snapshot is the boundary between untrusted data and the app.
 */
function normaliseLineup(value: unknown, fallbackFormation = "4-3-3") {
  if (Array.isArray(value)) {
    return { formation: fallbackFormation, players: value };
  }
  if (value && typeof value === "object") {
    const candidate = value as { formation?: unknown; players?: unknown };
    if (Array.isArray(candidate.players)) {
      return {
        formation:
          typeof candidate.formation === "string"
            ? candidate.formation
            : fallbackFormation,
        players: candidate.players,
      };
    }
  }
  return { formation: fallbackFormation, players: [] };
}

function normaliseMatch(match: Match): Match {
  const lineups = (match.lineups ?? {}) as unknown as {
    home?: unknown;
    away?: unknown;
  };

  return {
    ...match,
    lineups: {
      home: normaliseLineup(lineups.home),
      away: normaliseLineup(lineups.away),
    },
  };
}

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
    cached = {
      ...env,
      matches: env.matches.map(normaliseMatch),
      source: "env:FOOTBALL_SNAPSHOT",
    };
    return cached;
  }

  if (isSnapshot(snapshot) && snapshot.matches.length > 0) {
    cached = { ...snapshot, matches: snapshot.matches.map(normaliseMatch) };
    return cached;
  }

  cached = EMPTY;
  return cached;
}

/** True when real scraped data is being served instead of demo fixtures. */
export function hasRealData(): boolean {
  return getSnapshot().matches.length > 0;
}
