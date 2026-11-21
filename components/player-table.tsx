"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { COMPETITIONS } from "@/lib/data/teams";
import type { Player, Position } from "@/lib/types";

const POSITIONS: (Position | "ALL")[] = ["ALL", "GK", "DF", "MF", "FW"];

type SortKey =
  | "name"
  | "club"
  | "position"
  | "nationality"
  | "age"
  | "appearances"
  | "minutes"
  | "goals"
  | "assists"
  | "rating"
  | "goalsPer90";

type Column = {
  key: SortKey;
  label: string;
  align: "left" | "center" | "right";
};

const COLUMNS: Column[] = [
  { key: "name", label: "Player", align: "left" },
  { key: "club", label: "Club", align: "left" },
  { key: "position", label: "Pos", align: "center" },
  { key: "nationality", label: "Nationality", align: "left" },
  { key: "age", label: "Age", align: "center" },
  { key: "appearances", label: "Apps", align: "center" },
  { key: "goals", label: "G", align: "center" },
  { key: "assists", label: "A", align: "center" },
  { key: "rating", label: "Rating", align: "right" },
];

const PAGE_SIZE = 12;

const SELECT_CLASS =
  "rounded-lg border border-pitch-700 bg-pitch-900 px-2 py-1.5 text-xs font-semibold text-fg focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

function per90(player: Player): number {
  return player.minutes > 0 ? (player.goals / player.minutes) * 90 : 0;
}

function valueFor(player: Player, key: SortKey): string | number {
  if (key === "goalsPer90") return per90(player);
  return player[key as keyof Player] as string | number;
}

function ratingTone(rating: number): "brand" | "success" | "neutral" {
  if (rating >= 7.6) return "brand";
  if (rating >= 7.2) return "success";
  return "neutral";
}

export function PlayerTable({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<Position | "ALL">("ALL");
  const [competition, setCompetition] = useState<string>("ALL");
  const [nationality, setNationality] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(0);

  const nationalities = useMemo(
    () => ["ALL", ...Array.from(new Set(players.map((p) => p.nationality))).sort()],
    [players],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const rows = players.filter((player) => {
      const matchesQuery =
        needle.length === 0 ||
        player.name.toLowerCase().includes(needle) ||
        player.club.toLowerCase().includes(needle);
      const matchesPosition = position === "ALL" || player.position === position;
      const matchesCompetition =
        competition === "ALL" || player.competition === competition;
      const matchesNationality =
        nationality === "ALL" || player.nationality === nationality;
      return (
        matchesQuery && matchesPosition && matchesCompetition && matchesNationality
      );
    });

    return rows.sort((a, b) => {
      const left = valueFor(a, sortKey);
      const right = valueFor(b, sortKey);
      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return ascending ? comparison : -comparison;
    });
  }, [players, query, position, competition, nationality, sortKey, ascending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAscending((value) => !value);
    } else {
      setSortKey(key);
      setAscending(key === "name" || key === "club" || key === "nationality");
    }
    setPage(0);
  }

  function reset() {
    setQuery("");
    setPosition("ALL");
    setCompetition("ALL");
    setNationality("ALL");
    setSortKey("rating");
    setAscending(false);
    setPage(0);
  }

  return (
    <div>
      <div className="card mb-4 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search player or club…"
            className="w-full rounded-lg border border-pitch-700 bg-pitch-900 px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 lg:max-w-xs"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:ml-auto">
            <select
              aria-label="Filter by league"
              value={competition}
              onChange={(event) => {
                setCompetition(event.target.value);
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              <option value="ALL">All leagues</option>
              {COMPETITIONS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by nationality"
              value={nationality}
              onChange={(event) => {
                setNationality(event.target.value);
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              {nationalities.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All nations" : item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by position"
              value={position}
              onChange={(event) => {
                setPosition(event.target.value as Position | "ALL");
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              {POSITIONS.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All positions" : item}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort by"
              value={sortKey}
              onChange={(event) => {
                setSortKey(event.target.value as SortKey);
                setAscending(false);
                setPage(0);
              }}
              className={SELECT_CLASS}
            >
              {COLUMNS.filter((column) => column.key !== "name").map((column) => (
                <option key={column.key} value={column.key}>
                  Sort: {column.label}
                </option>
              ))}
              <option value="goalsPer90">Sort: Goals/90</option>
            </select>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-fg-dim">
          <span>
            {filtered.length} of {players.length} players
            {competition !== "ALL" ? ` · ${competition}` : ""}
            {nationality !== "ALL" ? ` · ${nationality}` : ""}
            {position !== "ALL" ? ` · ${position}` : ""}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded px-2 py-1 font-semibold text-fg-muted hover:text-brand-500"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-pitch-800 text-[10px] uppercase tracking-wider text-fg-dim">
                {COLUMNS.map((column) => {
                  const active = sortKey === column.key;
                  const alignClass =
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                        ? "text-right"
                        : "text-left";
                  return (
                    <th
                      key={column.key}
                      className={`px-3 py-2.5 font-semibold ${alignClass} ${
                        column.key === "name" ? "px-4" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`inline-flex items-center gap-1 transition-colors hover:text-brand-500 ${
                          active ? "text-brand-500" : ""
                        }`}
                      >
                        {column.label}
                        <span aria-hidden="true" className="text-[8px]">
                          {active ? (ascending ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((player) => (
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
                  </td>
                  <td className="px-3 py-2.5 text-fg-muted">{player.club}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge>{player.position}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-fg-muted">{player.nationality}</td>
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
                    <Badge tone={ratingTone(player.rating)}>
                      {player.rating.toFixed(2)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-fg-dim">
            No players match those filters.
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-fg-dim">
          Page {safePage + 1} of {pageCount}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={safePage === 0}
            className="rounded-lg border border-pitch-700 px-2.5 py-1.5 text-[11px] font-semibold text-fg-muted transition-colors hover:border-brand-700 hover:text-fg disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
            disabled={safePage >= pageCount - 1}
            className="rounded-lg border border-pitch-700 px-2.5 py-1.5 text-[11px] font-semibold text-fg-muted transition-colors hover:border-brand-700 hover:text-fg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
