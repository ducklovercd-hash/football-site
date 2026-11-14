import { hashString, intBetween, mulberry32, pick, seedFor } from "@/lib/prng";
import type {
  FormResult,
  LineupPlayer,
  Match,
  MatchEvent,
  MatchStatus,
  Position,
  TeamStats,
} from "@/lib/types";
import { COMPETITION_BY_CODE, TEAMS_BY_COMPETITION, TEAM_BY_ID, VENUES } from "./teams";
import { MATCHES as SCRAPED } from "./generated/matches.generated";

/* ------------------------------------------------------------------ */
/* Deterministic name pools for generated lineups                      */
/* ------------------------------------------------------------------ */

const FIRST_NAMES = [
  "Luca", "Marco", "Diego", "Andre", "Tomas", "Rafael", "Nico", "Emil",
  "Jonas", "Mateo", "Ivan", "Sergio", "Bruno", "Kai", "Leon", "Oscar",
  "Felix", "Hugo", "Milan", "Adam", "Noah", "Elias", "Theo", "Ruben",
];

const LAST_NAMES = [
  "Silva", "Moretti", "Keller", "Novak", "Duarte", "Bianchi", "Fischer",
  "Larsen", "Costa", "Vidal", "Petrov", "Mendes", "Rossi", "Weber",
  "Sousa", "Almeida", "Kovac", "Bauer", "Reyes", "Marchetti", "Hansen",
  "Ferreira", "Ivanov", "Schulz", "Navarro", "Berg", "Lombardi", "Dias",
];

const POSITION_PLAN: Position[] = [
  "GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW",
];

function buildLineup(teamId: number): LineupPlayer[] {
  const rand = mulberry32(seedFor("lineup", teamId));
  const used = new Set<string>();
  return POSITION_PLAN.map((position, index) => {
    let name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
    let guard = 0;
    while (used.has(name) && guard < 40) {
      name = `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`;
      guard += 1;
    }
    used.add(name);
    return { number: index + 1, name, position };
  });
}

function buildForm(teamId: number): FormResult[] {
  const rand = mulberry32(seedFor("form", teamId));
  const results: FormResult[] = [];
  for (let i = 0; i < 5; i += 1) {
    const roll = rand();
    results.push(roll < 0.45 ? "W" : roll < 0.72 ? "D" : "L");
  }
  return results;
}

function buildStrength(teamId: number) {
  const rand = mulberry32(seedFor("strength", teamId));
  return {
    attack: Number((0.72 + rand() * 0.72).toFixed(3)),
    defence: Number((0.72 + rand() * 0.72).toFixed(3)),
  };
}

/* ------------------------------------------------------------------ */
/* Fixture plan — kickoffs are anchored to "now" so the demo always    */
/* has live, finished and upcoming matches regardless of the hour.     */
/* ------------------------------------------------------------------ */

interface FixturePlan {
  comp: string;
  home: number;
  away: number;
  offsetMinutes: number;
}

/** -195 = finished, -68 = 2nd half, -31 = 1st half, +55 = upcoming */
const OFFSETS = [-195, -68, -31, 55];

function buildPlan(): FixturePlan[] {
  const plan: FixturePlan[] = [];
  for (const [comp, teams] of Object.entries(TEAMS_BY_COMPETITION)) {
    const pairs: [number, number][] = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ];
    // Shift each competition's schedule a little so kick-off times and live
    // minutes differ across leagues instead of all reading identically.
    const shift = (hashString(comp) % 29) - 14;

    pairs.forEach(([homeIndex, awayIndex], index) => {
      plan.push({
        comp,
        home: teams[homeIndex].id,
        away: teams[awayIndex].id,
        offsetMinutes: OFFSETS[index] + shift,
      });
    });
  }
  return plan;
}

const PLAN = buildPlan();

function roundToFiveMinutes(date: Date): Date {
  const ms = 5 * 60 * 1000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

function resolveState(
  kickoff: Date,
  now: Date,
): { status: MatchStatus; minute: number | null } {
  const elapsed = (now.getTime() - kickoff.getTime()) / 60000;
  if (elapsed < 0) return { status: "SCHEDULED", minute: null };
  if (elapsed < 45) return { status: "LIVE", minute: Math.max(1, Math.floor(elapsed)) };
  if (elapsed < 60) return { status: "HT", minute: 45 };
  if (elapsed < 105) {
    return { status: "LIVE", minute: Math.min(90, 45 + Math.floor(elapsed - 60)) };
  }
  return { status: "FT", minute: null };
}

/* ------------------------------------------------------------------ */
/* Generated match narrative: goals, cards, subs, stats                */
/* ------------------------------------------------------------------ */

interface Goal {
  minute: number;
  side: "home" | "away";
  player: string;
  penalty: boolean;
}

function goalCount(rand: () => number): number {
  const roll = rand();
  if (roll < 0.12) return 0;
  if (roll < 0.32) return 1;
  if (roll < 0.58) return 2;
  if (roll < 0.78) return 3;
  if (roll < 0.92) return 4;
  return 5;
}

function buildGoals(
  fixtureId: string,
  homeLineup: LineupPlayer[],
  awayLineup: LineupPlayer[],
): Goal[] {
  const rand = mulberry32(seedFor("goals", fixtureId));
  const total = goalCount(rand);
  const goals: Goal[] = [];
  for (let i = 0; i < total; i += 1) {
    const side: "home" | "away" = rand() < 0.54 ? "home" : "away";
    const squad = side === "home" ? homeLineup : awayLineup;
    const scorers = squad.filter((p) => p.position === "FW" || p.position === "MF");
    goals.push({
      minute: intBetween(rand, 4, 90),
      side,
      player: pick(rand, scorers).name,
      penalty: rand() < 0.1,
    });
  }
  return goals.sort((a, b) => a.minute - b.minute);
}

function buildCardsAndSubs(
  fixtureId: string,
  homeLineup: LineupPlayer[],
  awayLineup: LineupPlayer[],
): MatchEvent[] {
  const rand = mulberry32(seedFor("cards", fixtureId));
  const events: MatchEvent[] = [];
  const cardCount = intBetween(rand, 1, 4);

  for (let i = 0; i < cardCount; i += 1) {
    const side: "home" | "away" = rand() < 0.5 ? "home" : "away";
    const squad = side === "home" ? homeLineup : awayLineup;
    events.push({
      minute: intBetween(rand, 12, 88),
      type: rand() < 0.06 ? "RED" : "YELLOW",
      side,
      player: pick(rand, squad).name,
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const side: "home" | "away" = i % 2 === 0 ? "home" : "away";
    const squad = side === "home" ? homeLineup : awayLineup;
    events.push({
      minute: intBetween(rand, 55, 88),
      type: "SUB",
      side,
      player: pick(rand, squad).name,
      detail: "replaced",
    });
  }

  return events.sort((a, b) => a.minute - b.minute);
}

function scale(value: number, fraction: number): number {
  return Math.max(0, Math.round(value * fraction));
}

function buildStats(
  fixtureId: string,
  fraction: number,
  homeAttack: number,
  awayAttack: number,
): TeamStats {
  const rand = mulberry32(seedFor("stats", fixtureId));
  const possession = intBetween(rand, 36, 64);
  const homeShotsBase = intBetween(rand, 8, 19) * homeAttack;
  const awayShotsBase = intBetween(rand, 6, 17) * awayAttack;

  return {
    possession,
    shots: [scale(homeShotsBase, fraction), scale(awayShotsBase, fraction)],
    shotsOnTarget: [
      scale(homeShotsBase * 0.38, fraction),
      scale(awayShotsBase * 0.34, fraction),
    ],
    corners: [
      scale(intBetween(rand, 2, 9), fraction),
      scale(intBetween(rand, 1, 8), fraction),
    ],
    fouls: [
      scale(intBetween(rand, 6, 15), fraction),
      scale(intBetween(rand, 5, 14), fraction),
    ],
    xg: [
      Number((homeShotsBase * 0.11 * fraction).toFixed(2)),
      Number((awayShotsBase * 0.1 * fraction).toFixed(2)),
    ],
    passAccuracy: [intBetween(rand, 74, 91), intBetween(rand, 71, 89)],
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function buildMatch(plan: FixturePlan, now: Date): Match {
  const id = `${plan.comp}-${plan.home}-${plan.away}`;
  const kickoff = roundToFiveMinutes(
    new Date(now.getTime() + plan.offsetMinutes * 60 * 1000),
  );
  const { status, minute } = resolveState(kickoff, now);

  const home = TEAM_BY_ID[plan.home];
  const away = TEAM_BY_ID[plan.away];
  const competition = COMPETITION_BY_CODE[plan.comp];

  const homeLineup = buildLineup(plan.home);
  const awayLineup = buildLineup(plan.away);
  const goals = buildGoals(id, homeLineup, awayLineup);
  const incidents = buildCardsAndSubs(id, homeLineup, awayLineup);

  const homeStrength = buildStrength(plan.home);
  const awayStrength = buildStrength(plan.away);

  // How far through the match we are — used to scale cumulative stats.
  const elapsedMinutes =
    status === "SCHEDULED" ? 0 : status === "FT" ? 90 : (minute ?? 0);
  const fraction = Math.min(1, elapsedMinutes / 90);

  const visibleGoals = goals.filter((g) => g.minute <= elapsedMinutes);
  const score = {
    home:
      status === "SCHEDULED"
        ? null
        : visibleGoals.filter((g) => g.side === "home").length,
    away:
      status === "SCHEDULED"
        ? null
        : visibleGoals.filter((g) => g.side === "away").length,
  };

  const htGoals = goals.filter((g) => g.minute <= 45);
  const halfTime =
    status === "SCHEDULED"
      ? null
      : {
          home: htGoals.filter((g) => g.side === "home").length,
          away: htGoals.filter((g) => g.side === "away").length,
        };

  const goalEvents: MatchEvent[] = goals.map((g) => ({
    minute: g.minute,
    type: g.penalty ? "PEN" : "GOAL",
    side: g.side,
    player: g.player,
    detail: g.penalty ? "penalty" : undefined,
  }));

  const events = [...goalEvents, ...incidents]
    .filter((event) => event.minute <= elapsedMinutes)
    .sort((a, b) => b.minute - a.minute);

  return {
    id,
    competition,
    home,
    away,
    status,
    kickoff: kickoff.toISOString(),
    minute,
    score,
    halfTime,
    venue: VENUES[plan.home] ?? "Stadium",
    stats: buildStats(id, fraction, homeStrength.attack, awayStrength.attack),
    events,
    lineups: { home: homeLineup, away: awayLineup },
    form: { home: buildForm(plan.home), away: buildForm(plan.away) },
    strength: { home: homeStrength, away: awayStrength },
  };
}

/** All matches for "today", reconstructed for the given instant. */
export function getMatches(now: Date = new Date()): Match[] {
  // Prefer real scraped data (written by scripts/prepare-matches.mjs).
  // If the generated module is empty, fall back to the deterministic PRNG
  // fixture generator so the site always renders something.
  if (SCRAPED.length > 0) {
    return [...SCRAPED].sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
    );
  }
  return PLAN.map((plan) => buildMatch(plan, now)).sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );
}

export function getLiveMatches(now: Date = new Date()): Match[] {
  return getMatches(now).filter((m) => m.status === "LIVE" || m.status === "HT");
}

export function getMatchById(
  id: string,
  now: Date = new Date(),
): Match | undefined {
  return getMatches(now).find((match) => match.id === id);
}
