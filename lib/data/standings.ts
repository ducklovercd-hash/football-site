import { mulberry32, seedFor } from "@/lib/prng";
import type { FormResult, StandingRow } from "@/lib/types";
import { COMPETITIONS, TEAMS_BY_COMPETITION } from "./teams";

/**
 * Deterministic league tables.
 *
 * Generated from a per-team seeded stream so the table is stable across the
 * server render, hydration, and every rebuild. Sorted the way a real league
 * sorts: points, then goal difference, then goals scored.
 *
 * When a real provider is wired in this module is replaced by a
 * `/competitions/{code}/standings` fetch; the StandingRow shape stays.
 */

function buildForm(teamId: number): FormResult[] {
  const rand = mulberry32(seedFor("table-form", teamId));
  const results: FormResult[] = [];
  for (let i = 0; i < 5; i += 1) {
    const roll = rand();
    results.push(roll < 0.45 ? "W" : roll < 0.72 ? "D" : "L");
  }
  return results;
}

function buildRow(teamId: number) {
  const rand = mulberry32(seedFor("table-row", teamId));
  const played = 20;
  const won = 3 + Math.floor(rand() * 14);
  const drawn = Math.floor(rand() * (played - won + 1));
  const lost = played - won - drawn;
  const goalsFor = 15 + Math.floor(rand() * 40);
  const goalsAgainst = 10 + Math.floor(rand() * 35);

  return {
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: won * 3 + drawn,
  };
}

export function getStandings(competitionCode: string): StandingRow[] {
  const teams = TEAMS_BY_COMPETITION[competitionCode] ?? [];

  return teams
    .map((team) => ({ team, ...buildRow(team.id), form: buildForm(team.id) }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor,
    )
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function getAllStandings(): { code: string; rows: StandingRow[] }[] {
  return COMPETITIONS.map((competition) => ({
    code: competition.code,
    rows: getStandings(competition.code),
  }));
}
