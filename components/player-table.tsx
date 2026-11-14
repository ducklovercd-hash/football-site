"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Player, Position } from "@/lib/types";

const POSITIONS: (Position | "ALL")[] = ["ALL", "GK", "DF", "MF", "FW"];

type SortKey = "rating" | "goals" | "assists" | "minutes";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Rating" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "minutes", label: "Minutes" },
];

export function PlayerTable({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<Position | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("rating");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return players
      .filter((player) => {
        const matchesQuery =
          needle.length === 0 ||
          player.name.toLowerCase().includes(needle) ||
          player.club.toLowerCase().includes(needle) ||
          player.nationality.toLowerCase().includes(needle);
        const matchesPosition =
          position === "ALL" || player.position === position;
        return matchesQuery && matchesPosition;
      })
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [players, query, position, sortKey]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search player, club or nationality…"
          className="w-full rounded-lg border border-pitch-700 bg-pitch-900 px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 sm:max-w-xs"
        />

        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          {POSITIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPosition(option)}
              className={[
                "shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                position === option
                  ? "bg-brand-500 text-black"
                  : "border border-pitch-700 text-fg-muted hover:text-fg",
              ].join(" ")}
            >
              {option === "ALL" ? "All" : option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-[11px] uppercase tracking-wider text-fg-dim">
            Sort
          </span>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="rounded-lg border border-pitch-700 bg-pitch-900 px-2 py-1.5 text-xs font-semibold text-fg focus:border-brand-600 focus:outline-none"
          >
            {SORTS.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-pitch-800 text-[10px] uppercase tracking-wider text-fg-dim">
                <th className="px-4 py-2.5 font-semibold">Player</th>
                <th className="px-3 py-2.5 font-semibold">Club</th>
                <th className="px-3 py-2.5 text-center font-semibold">Pos</th>
                <th className="px-3 py-2.5 text-center font-semibold">Age</th>
                <th className="px-3 py-2.5 text-center font-semibold">Apps</th>
                <th className="px-3 py-2.5 text-center font-semibold">G</th>
                <th className="px-3 py-2.5 text-center font-semibold">A</th>
                <th className="px-4 py-2.5 text-right font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-pitch-800/60 transition-colors last:border-0 hover:bg-pitch-850"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/players/${player.slug}`}
                      className="font-semibold text-fg hover:text-brand-500"
                    >
                      {player.name}
                    </Link>
                    <span className="ml-2 text-[11px] text-fg-dim">
                      {player.nationality}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-fg-muted">{player.club}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="rounded bg-pitch-800 px-1.5 py-0.5 text-[10px] font-bold text-fg-muted">
                      {player.position}
                    </span>
                  </td>
                  <td className="tnum px-3 py-2.5 text-center text-fg-muted">
                    {player.age}
                  </td>
                  <td className="tnum px-3 py-2.5 text-center text-fg-muted">
                    {player.appearances}
                  </td>
                  <td className="tnum px-3 py-2.5 text-center font-semibold text-fg">
                    {player.goals}
                  </td>
                  <td className="tnum px-3 py-2.5 text-center text-fg-muted">
                    {player.assists}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={[
                        "tnum rounded px-1.5 py-0.5 text-xs font-bold",
                        player.rating >= 7.6
                          ? "bg-brand-500/15 text-brand-500"
                          : player.rating >= 7.2
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "text-fg-muted",
                      ].join(" ")}
                    >
                      {player.rating.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-fg-dim">
            No players match that search.
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-[11px] text-fg-dim">
        Showing {filtered.length} of {players.length} players.
      </p>
    </div>
  );
}
