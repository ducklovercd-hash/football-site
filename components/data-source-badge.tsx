"use client";

import { useEffect, useState } from "react";
import { formatKickoff } from "@/lib/format";

type FeedState =
  | { kind: "connecting" }
  | { kind: "live" }
  | { kind: "stale"; updatedAt: string; label: string }
  | { kind: "demo" };

/**
 * Header feed status. Polls /api/live (cheap, cached server-side) so the
 * badge reflects the actual data path: live FotMob, the committed snapshot
 * with its last-updated stamp, or demo fixtures when nothing else loaded.
 */
export function DataSourceBadge() {
  const [state, setState] = useState<FeedState>({ kind: "connecting" });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch("/api/live", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          source: string;
          updatedAt: string;
        };
        if (cancelled) return;
        if (data.source === "fotmob-live") {
          setState({ kind: "live" });
        } else if (data.source === "snapshot" && data.updatedAt) {
          setState({ kind: "stale", updatedAt: data.updatedAt, label: "Snapshot" });
        } else {
          setState({ kind: "demo" });
        }
      } catch {
        // Keep whatever we knew; the badge never blocks the page.
      }
    }

    check();
    const id = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <span
      role="status"
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-pitch-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fg-dim"
    >
      {state.kind === "live" ? (
        <>
          <span className="dot-live h-1.5 w-1.5 rounded-full bg-live" />
          Live data
        </>
      ) : state.kind === "stale" ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {state.label} · updated {formatKickoff(state.updatedAt)} HKT
        </>
      ) : state.kind === "demo" ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-pitch-600" />
          Demo data
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-pitch-600" />
          Connecting
        </>
      )}
    </span>
  );
}
