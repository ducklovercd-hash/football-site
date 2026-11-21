"use client";

import { useState } from "react";
import { FormPills } from "@/components/primitives/form-pills";
import { TeamCrest } from "@/components/team-crest";
import { COMPETITIONS } from "@/lib/data/teams";
import type { StandingRow } from "@/lib/types";

/**
 * League table with a competition switcher.
 *
 * Rows carry the same visual grammar as the TailAdmin table component:
 * header row, tabular numerals, hover state, form column on the right.
 * The left-edge stripe is a football-specific touch for promotion zones.
 */
function zoneBorder(position: number, total: number): string {
  if (position <= 4) return "border-l-2 border-l-brand-500";
  if (position <= 6) return "border-l-2 border-l-emerald-500/70";
  if (position >= total - 2) return "border-l-2 border-l-live/70";
  return "border-l-2 border-l-transparent";
}

export function StandingsBoard({
  data,
}: {
  data: { code: string; rows: StandingRow[] }[];
}) {
  const [active, setActive] = useState(data[0]?.code ?? "PL");
  const current = data.find((entry) => entry.code === active);
  const competition = COMPETITIONS.find((item) => item.code === active);

  return (
    <div>
      <div className="no-scrollbar mb-4 flex items-center gap-1.5 overflow-x-auto">
        {data.map((entry) => {
          const item = COMPETITIONS.find((c) => c.code === entry.code);
          const isActive = entry.code === active;
          return (
            <button
              key={entry.code}
              type="button"
              onClick={() => setActive(entry.code)}
              className={[
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-brand-500 text-black"
                  : "border border-pitch-700 text-fg-muted hover:border-brand-700 hover:text-fg",
              ].join(" ")}
            >
              <span aria-hidden="true">{item?.flag}</span>
              {item?.name ?? entry.code}
            </button>
          );
        })}
      </div>

      {current ? (
        <>
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pitch-800 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-fg-muted">
                {competition?.name} table
              </h2>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-fg-dim">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-0.5 bg-brand-500" /> UCL
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-0.5 bg-emerald-500/70" /> Europe
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-0.5 bg-live/70" /> Drop
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-pitch-800 text-[10px] uppercase tracking-wider text-fg-dim">
                    <th className="px-3 py-2.5 text-center font-semibold">#</th>
                    <th className="px-3 py-2.5 font-semibold">Team</th>
                    <th className="px-2 py-2.5 text-center font-semibold">P</th>
                    <th className="px-2 py-2.5 text-center font-semibold">W</th>
                    <th className="px-2 py-2.5 text-center font-semibold">D</th>
                    <th className="px-2 py-2.5 text-center font-semibold">L</th>
                    <th className="px-2 py-2.5 text-center font-semibold">GF</th>
                    <th className="px-2 py-2.5 text-center font-semibold">GA</th>
                    <th className="px-2 py-2.5 text-center font-semibold">GD</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Pts</th>
                    <th className="px-4 py-2.5 font-semibold">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {current.rows.map((row) => (
                    <tr
                      key={row.team.id}
                      className={`border-b border-pitch-800/60 transition-colors last:border-0 hover:bg-pitch-850 ${zoneBorder(
                        row.position,
                        current.rows.length,
                      )}`}
                    >
                      <td className="tnum px-3 py-2.5 text-center font-bold text-fg-dim">
                        {row.position}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <TeamCrest team={row.team} size={22} />
                          <span className="truncate font-semibold text-fg">
                            {row.team.name}
                          </span>
                        </span>
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.played}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.won}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.drawn}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.lost}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.goalsFor}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.goalsAgainst}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center text-fg-muted">
                        {row.goalDifference > 0
                          ? `+${row.goalDifference}`
                          : row.goalDifference}
                      </td>
                      <td className="tnum px-2 py-2.5 text-center font-extrabold text-brand-500">
                        {row.points}
                      </td>
                      <td className="px-4 py-2.5">
                        <FormPills form={row.form} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-fg-dim">
            {current.rows.length} teams · demo standings generated
            deterministically.
          </p>
        </>
      ) : null}
    </div>
  );
}
