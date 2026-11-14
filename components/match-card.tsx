import Link from "next/link";
import { formatKickoff } from "@/lib/format";
import type { FormResult, Match } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { TeamCrest } from "./team-crest";

function FormPills({ form }: { form: FormResult[] }) {
  return (
    <span className="flex items-center gap-1">
      {form.map((result, index) => (
        <span
          key={index}
          className={[
            "flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-bold",
            result === "W"
              ? "bg-emerald-500/20 text-emerald-400"
              : result === "D"
                ? "bg-pitch-700 text-fg-muted"
                : "bg-live/20 text-live",
          ].join(" ")}
        >
          {result}
        </span>
      ))}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const isScheduled = match.status === "SCHEDULED";
  const homeWinning =
    !isScheduled &&
    (match.score.home ?? 0) > (match.score.away ?? 0);
  const awayWinning =
    !isScheduled &&
    (match.score.away ?? 0) > (match.score.home ?? 0);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="card card-hover block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-wider text-fg-dim">
          <span aria-hidden="true">{match.competition.flag}</span>
          {match.competition.name}
        </span>
        <StatusBadge status={match.status} minute={match.minute} />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
          <span
            className={[
              "truncate text-sm font-semibold",
              homeWinning ? "text-fg" : "text-fg-muted",
            ].join(" ")}
          >
            {match.home.name}
          </span>
          <TeamCrest team={match.home} />
        </div>

        <div className="min-w-[64px] text-center">
          {isScheduled ? (
            <span className="tnum text-sm font-semibold text-fg-muted">
              {formatKickoff(match.kickoff)}
            </span>
          ) : (
            <span className="tnum text-xl font-extrabold tracking-tight text-fg">
              {match.score.home}
              <span className="mx-1 text-pitch-600">-</span>
              {match.score.away}
            </span>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <TeamCrest team={match.away} />
          <span
            className={[
              "truncate text-sm font-semibold",
              awayWinning ? "text-fg" : "text-fg-muted",
            ].join(" ")}
          >
            {match.away.name}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-pitch-800 pt-2.5">
        <span className="truncate text-[11px] text-fg-dim">{match.venue}</span>
        <div className="flex items-center gap-2">
          <FormPills form={match.form.home} />
          <span className="text-[10px] text-pitch-600">vs</span>
          <FormPills form={match.form.away} />
        </div>
      </div>
    </Link>
  );
}
