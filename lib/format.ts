/**
 * All date formatting is pinned to a single timezone so the server render and
 * the client hydration always produce identical strings. (Vercel functions run
 * in UTC; the browser does not, an unpinned formatter causes hydration errors.)
 * The audience is in Hong Kong, so the site speaks HKT.
 */
export const DISPLAY_TZ = "Asia/Hong_Kong";
export const DISPLAY_TZ_LABEL = "HKT";

/** "2026-11-21" for the site timezone, independent of the host clock. */
export function siteTodayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: DISPLAY_TZ,
});

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: DISPLAY_TZ,
});

const longDayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: DISPLAY_TZ,
});

export function formatKickoff(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function formatDay(iso: string): string {
  return dayFmt.format(new Date(iso));
}

export function formatLongDay(iso: string): string {
  return longDayFmt.format(new Date(iso));
}

export function formatPct(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatOdds(value: number): string {
  return value.toFixed(2);
}

/** "just now" / "42s ago" / "3m ago", used for the data freshness stamp. */
export function formatAgo(iso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function statusLabel(status: string, minute: number | null): string {
  if (status === "LIVE") return `${minute ?? 0}'`;
  if (status === "HT") return "HT";
  if (status === "FT") return "FT";
  return "Upcoming";
}

/** "Steven Bergwijn" -> "S. Bergwijn", the broadcast lineup label style. */
export function shortPlayerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

/** "Steven Bergwijn" -> "SB", for the avatar initials fallback. */
export function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}
