#!/usr/bin/env node
/**
 * prepare-matches.mjs
 *
 * Converts raw scraper output (an array of Match objects from sofascore-scraper)
 * into the snapshot the app reads at runtime:
 *
 *     lib/data/generated/matches.json
 *
 * The snapshot is committed and statically imported, so the site always builds.
 * To push fresh data without a rebuild, put the same JSON in the
 * FOOTBALL_SNAPSHOT environment variable (see lib/data/snapshot.ts).
 *
 * Usage:
 *   node scripts/prepare-matches.mjs [path/to/scraped.json]
 *
 * With no argument it uses the newest lib/data/generated/matches-*.json.
 */

import { readdir, stat, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const generatedDir = path.join(root, "lib", "data", "generated");
const outPath = path.join(generatedDir, "matches.json");

/** League metadata the scraper does not emit (flag/country live in the site). */
const LEAGUE_META = {
  PL: { name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  SA: { name: "Serie A", country: "Italy", flag: "🇮🇹" },
  PD: { name: "La Liga", country: "Spain", flag: "🇪🇸" },
  BL1: { name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  FL1: { name: "Ligue 1", country: "France", flag: "🇫🇷" },
  UCL: { name: "Champions League", country: "Europe", flag: "🏆" },
  UEL: { name: "Europa League", country: "Europe", flag: "🏆" },
};

const STATUSES = new Set(["SCHEDULED", "LIVE", "HT", "FT"]);
const POSITIONS = new Set(["GK", "DF", "MF", "FW"]);
const EVENT_TYPES = new Set(["GOAL", "PEN", "YELLOW", "RED", "SUB"]);

const problems = [];

/** Coerce a stat pair into exactly two finite non-negative numbers. */
function pair(value, label, id) {
  if (!Array.isArray(value) || value.length !== 2) {
    problems.push(`${id}: stats.${label} is not a 2-element array`);
    return [0, 0];
  }
  const out = value.map((v) => (Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0));
  return out;
}

function clampMultiplier(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(1.6, Math.max(0.6, Number(n.toFixed(3))));
}

function normaliseTeam(team, id, side) {
  if (!team || typeof team !== "object") {
    problems.push(`${id}: missing ${side} team`);
    return { id: 0, name: "Unknown", short: "UNK", color: "#1E293B" };
  }
  const name = String(team.name ?? "Unknown");
  return {
    id: Number(team.id) || 0,
    name,
    short: String(team.short ?? name.slice(0, 3)).toUpperCase().slice(0, 4),
    color: /^#[0-9a-f]{6}$/i.test(String(team.color)) ? String(team.color) : "#1E293B",
  };
}

function normaliseCompetition(comp, id) {
  const code = String(comp?.code ?? "").toUpperCase();
  const meta = LEAGUE_META[code];
  if (!meta) problems.push(`${id}: unknown competition code "${code}"`);
  return {
    code: code || "UNK",
    name: meta?.name ?? String(comp?.name ?? "Unknown"),
    country: meta?.country ?? String(comp?.country ?? ""),
    flag: meta?.flag ?? String(comp?.flag ?? ""),
  };
}


function normaliseMatch(raw) {
  const id = String(raw?.id ?? "");
  if (!id) {
    problems.push("entry with no id — skipped");
    return null;
  }

  const status = STATUSES.has(raw.status) ? raw.status : "SCHEDULED";
  const live = status === "LIVE" || status === "HT";
  const minute = live && Number.isFinite(Number(raw.minute)) ? Number(raw.minute) : null;

  const scoreHome = raw.score?.home;
  const scoreAway = raw.score?.away;
  const stats = raw.stats ?? {};
  const lineups = raw.lineups ?? {};

  const half = raw.halfTime;
  const halfTime =
    half && Number.isFinite(Number(half.home)) && Number.isFinite(Number(half.away))
      ? { home: Number(half.home), away: Number(half.away) }
      : null;

  const toLineup = (arr) =>
    (Array.isArray(arr) ? arr : []).map((p) => ({
      number: Number(p.number) || 0,
      name: String(p.name ?? "Unknown"),
      position: POSITIONS.has(p.position) ? p.position : "MF",
    }));

  return {
    id,
    competition: normaliseCompetition(raw.competition, id),
    home: normaliseTeam(raw.home, id, "home"),
    away: normaliseTeam(raw.away, id, "away"),
    status,
    kickoff: String(raw.kickoff ?? new Date().toISOString()),
    minute,
    score: {
      home: Number.isFinite(Number(scoreHome)) ? Number(scoreHome) : null,
      away: Number.isFinite(Number(scoreAway)) ? Number(scoreAway) : null,
    },
    halfTime,
    venue: String(raw.venue ?? ""),
    stats: {
      possession: pair(stats.possession, "possession", id),
      shots: pair(stats.shots, "shots", id),
      shotsOnTarget: pair(stats.shotsOnTarget, "shotsOnTarget", id),
      corners: pair(stats.corners, "corners", id),
      fouls: pair(stats.fouls, "fouls", id),
      xg: pair(stats.xg, "xg", id),
      passAccuracy: pair(stats.passAccuracy, "passAccuracy", id),
    },
    events: (Array.isArray(raw.events) ? raw.events : [])
      .filter((e) => EVENT_TYPES.has(e?.type) && (e?.side === "home" || e?.side === "away"))
      .map((e) => ({
        minute: Number(e.minute) || 0,
        type: e.type,
        side: e.side,
        player: String(e.player ?? "Unknown"),
        ...(e.detail ? { detail: String(e.detail) } : {}),
      }))
      .sort((a, b) => a.minute - b.minute),
    lineups: { home: toLineup(lineups.home), away: toLineup(lineups.away) },
    form: {
      home: (Array.isArray(raw.form?.home) ? raw.form.home : [])
        .filter((r) => r === "W" || r === "D" || r === "L")
        .slice(0, 5),
      away: (Array.isArray(raw.form?.away) ? raw.form.away : [])
        .filter((r) => r === "W" || r === "D" || r === "L")
        .slice(0, 5),
    },
    strength: {
      home: {
        attack: clampMultiplier(raw.strength?.home?.attack),
        defence: clampMultiplier(raw.strength?.home?.defence),
      },
      away: {
        attack: clampMultiplier(raw.strength?.away?.attack),
        defence: clampMultiplier(raw.strength?.away?.defence),
      },
    },
  };
}


async function resolveInput(explicit) {
  if (explicit) return path.resolve(explicit);
  let files = [];
  try {
    files = await readdir(generatedDir);
  } catch {
    return null;
  }
  const candidates = files
    .filter((f) => /^matches-.*\.json$/.test(f))
    .map((f) => path.join(generatedDir, f));
  if (candidates.length === 0) return null;
  const stamped = await Promise.all(
    candidates.map(async (p) => ({ p, mtime: (await stat(p)).mtimeMs })),
  );
  stamped.sort((a, b) => b.mtime - a.mtime);
  return stamped[0].p;
}

async function main() {
  const explicit = process.argv[2];
  const input = await resolveInput(explicit);

  let matches = [];
  let source = null;

  if (input) {
    const raw = JSON.parse(await readFile(input, "utf8"));
    const list = Array.isArray(raw) ? raw : (raw.matches ?? []);
    source = path.relative(root, input);
    matches = list.map(normaliseMatch).filter(Boolean);
    console.log(`[prepare-matches] ${matches.length} matches from ${source}`);
  } else if (explicit) {
    console.error(`[prepare-matches] file not found: ${explicit}`);
    process.exit(1);
  } else {
    console.warn("[prepare-matches] no scraped matches found — writing an empty snapshot.");
    console.warn("[prepare-matches] the site keeps using demo data until you run the scraper");
  }

  if (problems.length > 0) {
    console.warn(`[prepare-matches] ${problems.length} validation warning(s):`);
    for (const p of problems.slice(0, 15)) console.warn(`  - ${p}`);
    if (problems.length > 15) console.warn(`  ... and ${problems.length - 15} more`);
  }

  const snapshot = {
    generatedAt: matches.length > 0 ? new Date().toISOString() : null,
    source,
    matches,
  };

  await mkdir(generatedDir, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`[prepare-matches] wrote ${path.relative(root, outPath)} (${matches.length} matches)`);
  if (matches.length === 0) {
    console.log("[prepare-matches] tip: FOOTBALL_SNAPSHOT env var overrides this file at runtime");
  }
}

main().catch((err) => {
  console.error("[prepare-matches] failed:", err);
  process.exit(1);
});
