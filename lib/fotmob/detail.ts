import type { Match, MatchEvent, Position, TeamLineup } from "../types";
import {
  DEFAULT_TEAM_COLOR,
  DETAIL_IDLE_TTL_S,
  DETAIL_LIVE_TTL_S,
  FETCH_TIMEOUT_MS,
  FOTMOB_BASE,
  FOTMOB_HEADERS,
  type CachedFetchInit,
} from "./config";
import type { FotMobFixture } from "./fixtures";

export interface FotMobDetail {
  general?: {
    leagueName?: string;
    teamColors?: {
      lightMode?: { home?: string; away?: string };
    };
  };
  header?: {
    teams?: Array<{ name?: string; id?: number; score?: number | null }>;
  };
  content?: {
    matchFacts?: {
      events?: { events?: FotMobEvent[] } | null;
      teamForm?: TeamFormEntry[][] | null;
      infoBox?: { Stadium?: { name?: string } };
    };
    stats?: {
      Periods?: Record<string, { stats?: StatGroup[] }>;
    };
    lineup?: {
      lineupType?: string;
      homeTeam?: FotMobLineupTeam;
      awayTeam?: FotMobLineupTeam;
    } | null;
  };
}

interface StatGroup {
  title?: string;
  key?: string;
  stats?: Array<{
    title?: string;
    key?: string;
    stats?: Array<number | string | null>;
  }>;
}

interface FotMobEvent {
  time?: number;
  type?: string;
  isHome?: boolean | null;
  fullName?: string;
  card?: string;
  ownGoal?: boolean | null;
  goalDescriptionKey?: string | null;
  isPenaltyShootoutEvent?: boolean | null;
  homeScore?: number;
  awayScore?: number;
  halfStrShort?: string;
  swap?: Array<{ name?: string } | null>;
}

interface TeamFormEntry {
  resultString?: string;
  tooltipText?: {
    homeTeamId?: number | string;
    homeScore?: number | string;
    awayScore?: number | string;
  };
}

interface FotMobLineupTeam {
  formation?: string;
  starters?: FotMobPlayer[];
  subs?: FotMobPlayer[];
}

interface FotMobPlayer {
  id?: number | string;
  name?: string;
  shirtNumber?: number | string;
  usualPlayingPositionId?: number;
  countryName?: string;
  performance?: { rating?: number };
}

/** FotMob's public headshot CDN, keyed by the player id from the lineup. */
const playerPhotoUrl = (id: number | string | undefined): string | undefined =>
  id === undefined || id === null || `${id}`.length === 0
    ? undefined
    : `https://images.fotmob.com/image/player/${id}/small`;

export type DetailResult =
  | { ok: true; detail: FotMobDetail }
  | { ok: false; reason: string };

/**
 * Live matches revalidate every DETAIL_LIVE_TTL_S; everything else sits for
 * an hour because finished-match data does not change.
 */
export async function fetchMatchDetail(
  matchId: string,
  isLive: boolean,
): Promise<DetailResult> {
  const url = `${FOTMOB_BASE}/matchDetails?matchId=${matchId}`;
  const revalidate = isLive ? DETAIL_LIVE_TTL_S : DETAIL_IDLE_TTL_S;
  try {
    const init: CachedFetchInit = {
      headers: FOTMOB_HEADERS,
      next: { revalidate },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    };
    const response = await fetch(url, init);
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status} for match ${matchId}` };
    }
    return { ok: true, detail: (await response.json()) as FotMobDetail };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `match ${matchId} detail failed: ${reason}` };
  }
}

const toInt = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const toFloat = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** FotMob wraps minutes with direction marks: "66\u200e\u2019\u200e" -> 66. */
function statByKey(flat: Array<{ key?: string; stats?: Array<number | string | null> }>, key: string) {
  for (const stat of flat) {
    if (stat.key === key) return stat.stats ?? [null, null];
  }
  return [null, null];
}

function flattenStats(detail: FotMobDetail) {
  const groups =
    detail.content?.stats?.Periods?.["All"]?.stats ?? [];
  const flat: Array<{ key?: string; stats?: Array<number | string | null> }> = [];
  for (const group of groups) {
    for (const stat of group.stats ?? []) flat.push(stat);
  }
  return flat;
}

function pair(values: Array<number | string | null>): [number, number] {
  return [toInt(values[0]), toInt(values[1])];
}

function mapStats(detail: FotMobDetail): Match["stats"] | null {
  const flat = flattenStats(detail);
  if (flat.length === 0) return null;

  // "394 (84%)" -> 84; possession and pass accuracy arrive as percentages.
  const passAccuracy: [number, number] = [0, 0];
  const accuratePasses = statByKey(flat, "accurate_passes");
  passAccuracy[0] = percentInside(accuratePasses[0]);
  passAccuracy[1] = percentInside(accuratePasses[1]);

  return {
    possession: toInt(statByKey(flat, "BallPossesion")[0], 50),
    shots: pair(statByKey(flat, "total_shots")),
    shotsOnTarget: pair(statByKey(flat, "ShotsOnTarget")),
    corners: pair(statByKey(flat, "corners")),
    fouls: pair(statByKey(flat, "fouls")),
    xg: [
      Number(toFloat(statByKey(flat, "expected_goals")[0]).toFixed(2)),
      Number(toFloat(statByKey(flat, "expected_goals")[1]).toFixed(2)),
    ],
    passAccuracy,
  };
}

function percentInside(value: number | string | null | undefined): number {
  const match = /\((\d+)%\)/.exec(String(value ?? ""));
  return match ? toInt(match[1]) : 0;
}

const POSITION_BY_ID: Record<number, Position> = {
  0: "GK",
  1: "DF",
  2: "MF",
  3: "FW",
};

function mapLineupTeam(team: FotMobLineupTeam | undefined): TeamLineup | null {
  const starters = team?.starters ?? [];
  const subs = team?.subs ?? [];
  if (starters.length === 0 && subs.length === 0) return null;
  const players = [...starters, ...subs].map((player) => {
    const photoUrl = playerPhotoUrl(player.id);
    return {
      number: toInt(player.shirtNumber),
      name: player.name ?? "Unknown",
      position: POSITION_BY_ID[player.usualPlayingPositionId ?? 2] ?? "MF",
      rating: Number(toFloat(player.performance?.rating).toFixed(1)),
      nationality: player.countryName ?? "",
      ...(photoUrl ? { photoUrl } : {}),
    };
  });
  return { formation: team?.formation ?? "4-3-3", players };
}

function mapEvents(detail: FotMobDetail): MatchEvent[] | null {
  const raw = detail.content?.matchFacts?.events?.events;
  if (!raw) return null;
  const events: MatchEvent[] = [];
  for (const event of raw) {
    if (event.isHome === null || event.isHome === undefined) continue;
    const side: "home" | "away" = event.isHome ? "home" : "away";
    const minute = toInt(event.time);
    if (event.type === "Goal") {
      const isPenalty =
        event.isPenaltyShootoutEvent === true ||
        /penalty/i.test(String(event.goalDescriptionKey ?? ""));
      events.push({
        minute,
        type: isPenalty ? "PEN" : "GOAL",
        side,
        player: event.fullName ?? "Unknown",
      });
    } else if (event.type === "Card") {
      const card = String(event.card ?? "").toLowerCase();
      if (card.includes("red")) {
        events.push({ minute, type: "RED", side, player: event.fullName ?? "Unknown" });
      } else if (card.includes("yellow")) {
        events.push({ minute, type: "YELLOW", side, player: event.fullName ?? "Unknown" });
      }
    } else if (event.type === "Substitution") {
      const swap = event.swap ?? [];
      const replaced = swap[1]?.name;
      events.push({
        minute,
        type: "SUB",
        side,
        player: swap[0]?.name ?? "Unknown",
        detail: replaced ? `replaced ${replaced}` : "substitution",
      });
    }
  }
  events.sort((a, b) => a.minute - b.minute);
  return events;
}

function mapHalfTime(detail: FotMobDetail): Match["halfTime"] {
  const raw = detail.content?.matchFacts?.events?.events ?? [];
  for (const event of raw) {
    if (event.type === "Half" && event.halfStrShort === "HT") {
      return { home: toInt(event.homeScore), away: toInt(event.awayScore) };
    }
  }
  return null;
}

/** FotMob lists oldest first; the site contract expects newest first. */
function mapForm(detail: FotMobDetail): Match["form"] | null {
  const teamForm = detail.content?.matchFacts?.teamForm;
  if (!teamForm) return null;
  const sides = ["home", "away"] as const;
  const form = { home: [], away: [] } as Match["form"];
  sides.forEach((side, index) => {
    const entries = teamForm[index] ?? [];
    form[side] = [...entries]
      .reverse()
      .map((entry) => entry.resultString)
      .filter((result): result is "W" | "D" | "L" =>
        result === "W" || result === "D" || result === "L",
      )
      .slice(0, 5);
  });
  return form;
}

function clampMultiplier(value: number): number {
  return Math.min(1.6, Math.max(0.6, Number(value.toFixed(3))));
}

/**
 * Same heuristic as the Python reference (fotmob_transform.py): attack and
 * defence drift from 1.0 with recent goals scored and conceded, derived from
 * the teamForm tooltips rather than extra requests.
 */
function mapStrength(detail: FotMobDetail): Match["strength"] | null {
  const teamForm = detail.content?.matchFacts?.teamForm;
  const teams = detail.header?.teams ?? [];
  if (!teamForm || teamForm.length < 2) return null;
  const out = {} as Match["strength"];
  (["home", "away"] as const).forEach((side, index) => {
    const teamId = teams[index]?.id;
    let scored = 0;
    let conceded = 0;
    let played = 0;
    for (const entry of teamForm[index] ?? []) {
      const tooltip = entry.tooltipText;
      if (
        tooltip?.homeScore === undefined ||
        tooltip?.awayScore === undefined
      ) {
        continue;
      }
      const homeScore = toInt(tooltip.homeScore);
      const awayScore = toInt(tooltip.awayScore);
      const wasHome = String(tooltip.homeTeamId) === String(teamId);
      if (wasHome) {
        scored += homeScore;
        conceded += awayScore;
      } else {
        scored += awayScore;
        conceded += homeScore;
      }
      played += 1;
    }
    if (played === 0) {
      out[side] = { attack: 1, defence: 1 };
      return;
    }
    const attack = 1 + Math.min(0.6, (scored - 1.5 * played) / played);
    const defence = 1 + Math.min(0.6, (conceded - 1.2 * played) / played);
    out[side] = {
      attack: clampMultiplier(attack),
      defence: clampMultiplier(defence),
    };
  });
  return out;
}

/**
 * Fills the light match's deep fields (and team colors/venue) from the
 * matchDetails payload. Light status, score and minute stay as they are:
 * the fixtures payload is equally fresh and already normalised.
 */
export function applyDetail(match: Match, detail: FotMobDetail): Match {
  const colors = detail.general?.teamColors?.lightMode;
  const homeColor = colors?.home;
  const awayColor = colors?.away;
  const homeLineup = mapLineupTeam(detail.content?.lineup?.homeTeam);
  const awayLineup = mapLineupTeam(detail.content?.lineup?.awayTeam);

  return {
    ...match,
    home: {
      ...match.home,
      color: /^#[0-9a-fA-F]{6}$/.test(homeColor ?? "")
        ? homeColor!
        : match.home.color || DEFAULT_TEAM_COLOR,
    },
    away: {
      ...match.away,
      color: /^#[0-9a-fA-F]{6}$/.test(awayColor ?? "")
        ? awayColor!
        : match.away.color || DEFAULT_TEAM_COLOR,
    },
    halfTime: mapHalfTime(detail),
    venue: detail.content?.matchFacts?.infoBox?.Stadium?.name ?? "",
    stats: mapStats(detail) ?? match.stats,
    events: mapEvents(detail) ?? match.events,
    lineups: {
      home: homeLineup ?? match.lineups.home,
      away: awayLineup ?? match.lineups.away,
    },
    form: mapForm(detail) ?? match.form,
    strength: mapStrength(detail) ?? match.strength,
  };
}

/** Fixture summary status decides which detail revalidate TTL applies. */
export function fixtureIsLive(fixture: FotMobFixture): boolean {
  const status = fixture.status;
  return Boolean(status.started && !status.finished && !status.cancelled);
}
