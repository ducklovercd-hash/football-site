export const FOTMOB_BASE = "https://www.fotmob.com/api/data";

/** FotMob serves JSON to browser-like requests; no cookie or token needed. */
export const FOTMOB_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.fotmob.com/",
  Origin: "https://www.fotmob.com",
};

/**
 * FotMob league ids are not stable across days (playoff stages get fresh
 * large ids), so leagues are matched on name + country code.
 */
export const LEAGUE_FILTER: Record<string, string> = {
  "Premier League|ENG": "PL",
  "LaLiga|ESP": "PD",
  "La Liga|ESP": "PD",
  "Serie A|ITA": "SA",
  "Bundesliga|GER": "BL1",
  "Ligue 1|FRA": "FL1",
};

/** League display metadata, same as scripts/prepare-matches.mjs LEAGUE_META. */
export const LEAGUE_META: Record<
  string,
  { name: string; country: string; flag: string }
> = {
  PL: { name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  PD: { name: "La Liga", country: "Spain", flag: "🇪🇸" },
  SA: { name: "Serie A", country: "Italy", flag: "🇮🇹" },
  BL1: { name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  FL1: { name: "Ligue 1", country: "France", flag: "🇫🇷" },
};

const envInt = (name: string, fallback: number) => {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Upstream fetch frequency is capped by the Next Data Cache: an entry only
 * re-fetches when a real request arrives after expiry, so an idle site makes
 * zero upstream calls.
 */
export const FIXTURES_TTL_S = envInt("FOTMOB_FIXTURES_TTL_S", 60);
export const DETAIL_LIVE_TTL_S = envInt("FOTMOB_DETAIL_LIVE_TTL_S", 60);
export const DETAIL_IDLE_TTL_S = envInt("FOTMOB_DETAIL_IDLE_TTL_S", 3600);

/** Parallel detail fetches per render; keeps us polite to FotMob. */
export const DETAIL_CONCURRENCY = envInt("FOTMOB_DETAIL_CONCURRENCY", 8);

export const FETCH_TIMEOUT_MS = 10_000;

export const DEFAULT_TEAM_COLOR = "#1E293B";

/**
 * fetch() options extended with Next's Data Cache directive; declared here so
 * these modules also typecheck outside the Next build (see tsconfig.test.json).
 */
export type CachedFetchInit = RequestInit & {
  next?: { revalidate: number };
};
