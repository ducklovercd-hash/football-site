import { cache } from "react";
import type { Match } from "../types";
import { DETAIL_CONCURRENCY } from "../fotmob/config";
import { fetchMatchDetail, applyDetail, fixtureIsLive } from "../fotmob/detail";
import { fetchFixtures, lightMatch, matchKey } from "../fotmob/fixtures";
import { getSnapshot } from "./snapshot";

export type LiveSource = "fotmob-live" | "snapshot" | "demo";

export interface LiveData {
  matches: Match[];
  source: LiveSource;
  updatedAt: string;
  /** Set when FotMob was unreachable and we degraded. */
  reason?: string;
}

function deepFieldsFromSnapshot(match: Match, fallback: Match | undefined): Match {
  if (!fallback) return match;
  return {
    ...match,
    halfTime: match.halfTime ?? fallback.halfTime,
    venue: match.venue || fallback.venue,
    stats: hasRealStats(match.stats) ? match.stats : fallback.stats,
    events: match.events.length > 0 ? match.events : fallback.events,
    lineups: {
      home: match.lineups.home.players.length > 0 ? match.lineups.home : fallback.lineups.home,
      away: match.lineups.away.players.length > 0 ? match.lineups.away : fallback.lineups.away,
    },
    form: {
      home: match.form.home.length > 0 ? match.form.home : fallback.form.home,
      away: match.form.away.length > 0 ? match.form.away : fallback.form.away,
    },
  };
}

function hasRealStats(stats: Match["stats"]): boolean {
  return (
    stats.shots[0] > 0 ||
    stats.shots[1] > 0 ||
    stats.xg[0] > 0 ||
    stats.xg[1] > 0
  );
}

/**
 * The day's matches, straight from FotMob, falling back to the committed
 * snapshot when FotMob cannot be reached. React cache() dedupes the fetches
 * within one request/render pass; the Next Data Cache dedupes them across
 * requests and viewers, revalidating only while someone is actually on the
 * site. Any calendar date works: FotMob archives past fixtures and publishes
 * future ones on the same endpoint.
 */
export const getLiveData = cache(async (date?: Date): Promise<LiveData> => {
  const fixtures = await fetchFixtures(date ?? new Date());
  if (!fixtures.ok) {
    const snapshot = getSnapshot();
    if (snapshot.matches.length > 0) {
      return {
        matches: snapshot.matches,
        source: "snapshot",
        updatedAt: snapshot.generatedAt ?? new Date().toISOString(),
        reason: fixtures.reason,
      };
    }
    return {
      matches: [],
      source: "demo",
      updatedAt: new Date().toISOString(),
      reason: fixtures.reason,
    };
  }

  const snapshotMatches = getSnapshot().matches;
  const snapshotByKey = new Map(
    snapshotMatches.map((match) => [
      matchKey(match.home.name, match.away.name),
      match,
    ]),
  );

  const matches: Match[] = [];
  const rows = fixtures.fixtures;
  for (let i = 0; i < rows.length; i += DETAIL_CONCURRENCY) {
    const chunk = rows.slice(i, i + DETAIL_CONCURRENCY);
    const built = await Promise.all(
      chunk.map(async (fixture) => {
        const base = lightMatch(fixture);
        const detail = await fetchMatchDetail(
          String(fixture.id),
          fixtureIsLive(fixture),
        );
        if (!detail.ok) {
          // Light fields still serve; deep fields come from the snapshot
          // when the same fixture was scraped locally.
          return deepFieldsFromSnapshot(
            base,
            snapshotByKey.get(matchKey(base.home.name, base.away.name)),
          );
        }
        return applyDetail(base, detail.detail);
      }),
    );
    matches.push(...built);
  }

  return {
    matches,
    source: "fotmob-live",
    updatedAt: fixtures.serverDate ?? new Date().toISOString(),
  };
});
