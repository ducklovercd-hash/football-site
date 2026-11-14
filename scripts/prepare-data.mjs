/**
 * Convert the raw player_profiles.csv (92,671 rows) into a compact
 * data/players.json in the exact shape the app consumes.
 *
 *   node scripts/prepare-data.mjs [path/to/player_profiles.csv]
 *
 * Run this locally, commit the resulting data/players.json, then delete the
 * raw CSV so it never ships to the browser.
 *
 * NOTE: the source file is Transfermarkt-style *biographical* data. It has no
 * performance columns (goals, assists, rating), so those are emitted as 0 and
 * should be joined from a real stats source later. Position is mapped from the
 * source's main_position bucket.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const defaultCsv = join(here, "..", "..", "footballapp", "player_profiles.csv");
const csvPath = process.argv[2] ? process.argv[2] : defaultCsv;
const outPath = join(here, "..", "data", "players.json");

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    return row;
  });
}

function mapPosition(value) {
  const bucket = (value || "").toLowerCase();
  if (bucket.startsWith("goal")) return "GK";
  if (bucket.startsWith("def")) return "DF";
  if (bucket.startsWith("mid")) return "MF";
  return "FW";
}

if (!existsSync(csvPath)) {
  console.error(`CSV not found at: ${csvPath}`);
  console.error("Pass a path: node scripts/prepare-data.mjs /path/to/player_profiles.csv");
  process.exit(1);
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const active = rows.filter((row) => (row.current_club_name || "").trim() !== "");

const players = active.map((row, index) => ({
  id: Number(row.player_id) || index + 1,
  name: row.player_name,
  slug: slugify(row.player_name || `player-${index}`),
  club: row.current_club_name,
  competition: row.competition_name || "",
  position: mapPosition(row.main_position || row.position),
  nationality: row.citizenship || row.country_of_birth || "",
  age: row.date_of_birth
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(row.date_of_birth).getTime()) /
            31557600000,
        ),
      )
    : 0,
  height: Number(row.height) || 0,
  foot: (row.foot === "Left" ? "Left" : row.foot === "Both" ? "Both" : "Right"),
  appearances: 0,
  minutes: 0,
  goals: 0,
  assists: 0,
  rating: 0,
  contractExpires: row.contract_expires || "",
}));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(players, null, 2));

console.log(
  `Wrote ${players.length} players to ${outPath} ` +
    `(from ${active.length} active of ${rows.length} total rows).`,
);
console.log("Performance stats (goals/assists/rating) are 0 pending a real source.");
