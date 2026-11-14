/**
 * All date formatting is pinned to a single timezone so the server render and
 * the client hydration always produce identical strings. (Vercel functions run
 * in UTC; the browser does not, an unpinned formatter causes hydration errors.)
 */
export const DISPLAY_TZ = "Europe/London";
export const DISPLAY_TZ_LABEL = "UK";

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
