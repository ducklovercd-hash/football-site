"use client";

import { useCallback, useEffect, useState } from "react";
import { formatAgo } from "@/lib/format";
import type { Match } from "@/lib/types";
import { MatchCard } from "./match-card";

const POLL_MS = 15_000;

/**
 * Client-side polling against our own cached route handler.
 *
 * The browser never talks to the upstream provider. /api/live is cached on
 * the server, so 10,000 viewers still cost one upstream request per interval.
 */
export function LiveBoard({
  initialMatches,
  initialUpdatedAt,
}: {
  initialMatches: Match[];
  initialUpdatedAt: string;
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [now, setNow] = useState(() => Date.parse(initialUpdatedAt));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/live", { cache: "no-store" });
      if (!response.ok) {
        setFailed(true);
        return;
      }
      const data = (await response.json()) as {
        matches: Match[];
        updatedAt: string;
      };
      setMatches(data.matches);
      setUpdatedAt(data.updatedAt);
      setFailed(false);
    } catch {
      // Keep the last good snapshot on a transient network error, but say so.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-fg-dim">
          <span className="dot-live h-1.5 w-1.5 rounded-full bg-live" />
          <span className="tnum">
            {matches.length} live {matches.length === 1 ? "match" : "matches"}
          </span>
          <span className="text-pitch-600">·</span>
          <span className="tnum">updated {formatAgo(updatedAt, now)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh((value) => !value)}
            className={[
              "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
              autoRefresh
                ? "bg-brand-500/15 text-brand-500"
                : "border border-pitch-700 text-fg-muted hover:text-fg",
            ].join(" ")}
          >
            {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-full border border-pitch-700 px-3 py-1.5 text-[11px] font-semibold text-fg-muted transition-colors hover:border-brand-700 hover:text-fg disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {failed ? (
        <div
          role="alert"
          className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-live/40 bg-live/10 px-3 py-2"
        >
          <span className="text-[11px] font-semibold text-fg">
            Could not refresh. Showing the last good snapshot from{" "}
            {formatAgo(updatedAt, now)}.
          </span>
          <button
            type="button"
            onClick={refresh}
            className="rounded border border-pitch-700 px-2 py-1 text-[11px] font-semibold text-fg hover:border-brand-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {matches.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-semibold text-fg">No matches in play</p>
          <p className="mt-1 text-xs text-fg-dim">
            Nothing is live for the selected leagues right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
