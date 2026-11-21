import type { Match, MatchStatus, Team } from "../types";
import {
  DEFAULT_TEAM_COLOR,
  FIXTURES_TTL_S,
  FETCH_TIMEOUT_MS,
  FOTMOB_BASE,
  FOTMOB_HEADERS,
  LEAGUE_FILTER,
  LEAGUE_META,
  type CachedFetchInit,
} from "./config";

export interface FotMobStatus {
  utcTime?: string;
  started?: boolean;
  finished?: boolean;
  cancelled?: boolean;
  ongoing?: boolean;
  liveTime?: { short?: string };
}

export interface FotMobFixture {
  id: number;
  home: { id: number; name: string; shortName?: string; score?: number | null };
  away: { id: number; name: string; shortName?: string; score?: number | null };
  status: FotMobStatus;
  /** Added while flattening the leagues array. */
  league: { id?: number; name?: string; ccode?: string };
}

export type FixturesResult =
  | { ok: true; fixtures: FotMobFixture[]; serverDate: string | null }
  | { ok: false; reason: string };

function compactDate(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * One request covers every fixture of the day (scores, minutes, status).
 * The Next Data Cache dedupes it across viewers; it only re-fetches after
 * FIXTURES_TTL_S AND when a real request arrives, so idle time is free.
 */
export async function fetchFixtures(now: Date): Promise<FixturesResult> {
  const url = `${FOTMOB_BASE}/matches?date=${compactDate(now)}`;
  try {
    const init: CachedFetchInit = {
      headers: FOTMOB_HEADERS,
      next: { revalidate: FIXTURES_TTL_S },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    };
    const response = await fetch(url, init);
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status} from ${url}` };
    }
    const payload = (await response.json()) as {
      leagues?: Array<{
        id?: number;
        name?: string;
        ccode?: string;
        matches?: FotMobFixture[];
      }>;
    };
    const fixtures: FotMobFixture[] = [];
    for (const league of payload.leagues ?? []) {
      const code = LEAGUE_FILTER[`${league.name ?? ""}|${league.ccode ?? ""}`];
      if (!code) continue;
      for (const match of league.matches ?? []) {
        fixtures.push({
          ...match,
          league: { id: league.id, name: league.name, ccode: league.ccode },
        });
      }
    }
    return { ok: true, fixtures, serverDate: response.headers.get("date") };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `fotmob fixtures fetch failed: ${reason}` };
  }
}

export function mapStatus(status: FotMobStatus): {
  status: MatchStatus;
  minute: number | null;
} {
  if (status.cancelled || status.finished) return { status: "FT", minute: null };
  if (!status.started) return { status: "SCHEDULED", minute: null };
  if (!status.ongoing) return { status: "HT", minute: 45 };
  const digits = (status.liveTime?.short ?? "").replace(/\D/g, "");
  return { status: "LIVE", minute: digits ? Number(digits) : null };
}

export function mapScore(fixture: FotMobFixture): {
  home: number | null;
  away: number | null;
} {
  const { status } = fixture;
  if (status.cancelled || !status.started) return { home: null, away: null };
  return { home: fixture.home.score ?? 0, away: fixture.away.score ?? 0 };
}

function mapTeam(
  team: FotMobFixture["home"],
  color: string | undefined,
): Team {
  return {
    id: team.id,
    name: team.name,
    short: (team.shortName || team.name).slice(0, 3).toUpperCase(),
    color: /^#[0-9a-fA-F]{6}$/.test(color ?? "") ? color! : DEFAULT_TEAM_COLOR,
  };
}

function mapCompetition(fixture: FotMobFixture) {
  const key = `${fixture.league.name ?? ""}|${fixture.league.ccode ?? ""}`;
  const code = LEAGUE_FILTER[key] ?? "UNK";
  const meta = LEAGUE_META[code];
  return {
    code,
    name: meta?.name ?? fixture.league.name ?? "Unknown",
    country: meta?.country ?? "",
    flag: meta?.flag ?? "",
  };
}

export function matchKey(home: string, away: string): string {
  return `${home.trim().toLowerCase()}|${away.trim().toLowerCase()}`;
}

/**
 * Builds a Match from the fixtures payload alone. Deep fields carry empty
 * defaults; fetchMatchDetail or the committed snapshot fills them in later.
 */
export function lightMatch(fixture: FotMobFixture): Match {
  const { status, minute } = mapStatus(fixture.status);
  const kickoff = fixture.status.utcTime ?? new Date().toISOString();
  return {
    id: String(fixture.id),
    competition: mapCompetition(fixture),
    home: mapTeam(fixture.home, undefined),
    away: mapTeam(fixture.away, undefined),
    status,
    kickoff,
    minute,
    score: mapScore(fixture),
    halfTime: null,
    venue: "",
    stats: emptyStats(),
    events: [],
    lineups: {
      home: { formation: "4-3-3", players: [] },
      away: { formation: "4-3-3", players: [] },
    },
    form: { home: [], away: [] },
    strength: {
      home: { attack: 1, defence: 1 },
      away: { attack: 1, defence: 1 },
    },
  };
}

function emptyStats() {
  return {
    possession: 50,
    shots: [0, 0],
    shotsOnTarget: [0, 0],
    corners: [0, 0],
    fouls: [0, 0],
    xg: [0, 0],
    passAccuracy: [0, 0],
  } as Match["stats"];
}
