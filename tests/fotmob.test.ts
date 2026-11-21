import test from "node:test";
import assert from "node:assert/strict";
import type { FotMobFixture } from "../lib/fotmob/fixtures";
import {
  lightMatch,
  mapScore,
  mapStatus,
  matchKey,
} from "../lib/fotmob/fixtures";
import detailPayload from "./fixtures/fotmob_match.json";
import { applyDetail } from "../lib/fotmob/detail";

const laLigaFixture: FotMobFixture = {
  id: 5868132,
  home: { id: 8315, name: "Athletic Club", score: 0 },
  away: { id: 9879, name: "Espanyol", score: 1 },
  status: {
    utcTime: "2026-11-20T20:00:00.000Z",
    started: true,
    finished: true,
    ongoing: false,
    cancelled: false,
  },
  league: { id: 87, name: "LaLiga", ccode: "ESP" },
};

test("mapStatus covers the four contract states", () => {
  assert.deepEqual(mapStatus({ cancelled: true }), { status: "FT", minute: null });
  assert.deepEqual(mapStatus({ finished: true }), { status: "FT", minute: null });
  assert.deepEqual(mapStatus({ started: false }), {
    status: "SCHEDULED",
    minute: null,
  });
  assert.deepEqual(mapStatus({ started: true, ongoing: false }), {
    status: "HT",
    minute: 45,
  });
  // FotMob wraps the minute with direction marks.
  assert.deepEqual(
    mapStatus({ started: true, ongoing: true, liveTime: { short: "66\u200e\u2019\u200e" } }),
    { status: "LIVE", minute: 66 },
  );
});

test("mapScore is null before kick-off, numbers after", () => {
  assert.deepEqual(
    mapScore({ ...laLigaFixture, status: { started: false } }),
    { home: null, away: null },
  );
  assert.deepEqual(mapScore(laLigaFixture), { home: 0, away: 1 });
});

test("lightMatch maps league name+ccode to the site competition", () => {
  const match = lightMatch(laLigaFixture);
  assert.equal(match.id, "5868132");
  assert.deepEqual(match.competition, {
    code: "PD",
    name: "La Liga",
    country: "Spain",
    flag: "\u{1F1EA}\u{1F1F8}",
  });
  assert.equal(match.status, "FT");
  assert.deepEqual(match.score, { home: 0, away: 1 });
  assert.equal(match.kickoff, "2026-11-20T20:00:00.000Z");
  assert.deepEqual(match.lineups.home.players, []);
  assert.deepEqual(match.strength.home, { attack: 1, defence: 1 });
});

test("matchKey normalises team names for cross-source merges", () => {
  assert.equal(matchKey("Man City", "Fulham"), matchKey("man city ", "FULHAM"));
});

test("applyDetail fills deep fields from a real matchDetails payload", () => {
  const match = applyDetail(lightMatch(laLigaFixture), detailPayload);

  assert.equal(match.venue, "Estadio de San Mam\u00e9s");
  assert.deepEqual(match.halfTime, { home: 0, away: 0 });

  assert.equal(match.stats.possession, 58);
  assert.deepEqual(match.stats.shots, [17, 6]);
  assert.deepEqual(match.stats.shotsOnTarget, [6, 3]);
  assert.deepEqual(match.stats.corners, [9, 2]);
  assert.deepEqual(match.stats.fouls, [16, 13]);
  assert.deepEqual(match.stats.xg, [1.45, 0.53]);
  assert.deepEqual(match.stats.passAccuracy, [84, 77]);

  assert.ok(match.events.length > 0);
  for (const event of match.events) {
    assert.ok(["GOAL", "PEN", "YELLOW", "RED", "SUB"].includes(event.type));
    assert.ok(event.side === "home" || event.side === "away");
  }
  const sub = match.events.find((event) => event.type === "SUB");
  assert.ok(sub, "fixture match has substitutions");
  assert.match(sub!.detail ?? "", /^replaced /);

  const firstHomePlayer = match.lineups.home.players[0];
  assert.equal(firstHomePlayer.name, "Unai Sim\u00f3n");
  assert.equal(firstHomePlayer.position, "GK");
  assert.equal(firstHomePlayer.number, 1);

  for (const side of ["home", "away"] as const) {
    assert.ok(match.form[side].length > 0);
    assert.ok(match.form[side].length <= 5);
    for (const result of match.form[side]) {
      assert.ok(result === "W" || result === "D" || result === "L");
    }
  }

  for (const side of ["home", "away"] as const) {
    const { attack, defence } = match.strength[side];
    assert.ok(attack >= 0.6 && attack <= 1.6);
    assert.ok(defence >= 0.6 && defence <= 1.6);
  }
  assert.equal(match.strength.home.attack, 1.6);
});
