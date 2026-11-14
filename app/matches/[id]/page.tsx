import Link from "next/link";
import { notFound } from "next/navigation";
import { PredictionPanel } from "@/components/prediction-panel";
import { StatBar } from "@/components/stat-bar";
import { StatusBadge } from "@/components/status-badge";
import { TeamCrest } from "@/components/team-crest";
import { getMatchById } from "@/lib/data/matches";
import { formatKickoff } from "@/lib/format";
import { predictMatch } from "@/lib/model/poisson";
import type { MatchEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const EVENT_ICON: Record<MatchEvent["type"], string> = {
  GOAL: "⚽",
  PEN: "🎯",
  YELLOW: "🟨",
  RED: "🟥",
  SUB: "🔁",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) return { title: "Match not found — PitchSide" };
  return {
    title: `${match.home.name} vs ${match.away.name} — PitchSide`,
    description: `${match.competition.name} match stats, timeline and prediction.`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();

  const prediction = predictMatch(match);
  const isScheduled = match.status === "SCHEDULED";

  return (
    <div>
      <Link
        href="/"
        className="text-[11px] font-semibold uppercase tracking-wider text-fg-dim hover:text-brand-500"
      >
        ← All matches
      </Link>

      <section className="pitch-texture card mt-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-dim">
            <span aria-hidden="true">{match.competition.flag}</span>
            {match.competition.name}
          </span>
          <StatusBadge status={match.status} minute={match.minute} />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <TeamCrest team={match.home} size={52} />
            <span className="text-sm font-bold text-fg sm:text-base">
              {match.home.name}
            </span>
          </div>

          <div className="text-center">
            {isScheduled ? (
              <>
                <p className="tnum text-2xl font-extrabold text-fg">
                  {formatKickoff(match.kickoff)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-fg-dim">
                  Kick-off
                </p>
              </>
            ) : (
              <>
                <p className="tnum text-4xl font-black tracking-tight text-fg">
                  {match.score.home}
                  <span className="mx-2 text-pitch-600">-</span>
                  {match.score.away}
                </p>
                {match.halfTime ? (
                  <p className="tnum text-[10px] uppercase tracking-wider text-fg-dim">
                    HT {match.halfTime.home}-{match.halfTime.away}
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <TeamCrest team={match.away} size={52} />
            <span className="text-sm font-bold text-fg sm:text-base">
              {match.away.name}
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-fg-dim">
          {match.venue}
        </p>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-muted">
            Match statistics
          </h2>
          <div className="space-y-3">
            <StatBar
              label="Possession"
              home={match.stats.possession}
              away={100 - match.stats.possession}
              suffix="%"
            />
            <StatBar
              label="Shots"
              home={match.stats.shots[0]}
              away={match.stats.shots[1]}
            />
            <StatBar
              label="On target"
              home={match.stats.shotsOnTarget[0]}
              away={match.stats.shotsOnTarget[1]}
            />
            <StatBar
              label="Corners"
              home={match.stats.corners[0]}
              away={match.stats.corners[1]}
            />
            <StatBar
              label="Fouls"
              home={match.stats.fouls[0]}
              away={match.stats.fouls[1]}
            />
            <StatBar
              label="Pass accuracy"
              home={match.stats.passAccuracy[0]}
              away={match.stats.passAccuracy[1]}
              suffix="%"
            />
            <StatBar
              label="Expected goals"
              home={match.stats.xg[0]}
              away={match.stats.xg[1]}
            />
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-muted">
            Timeline
          </h2>
          {match.events.length === 0 ? (
            <p className="py-6 text-center text-xs text-fg-dim">
              No events yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {match.events.map((event, index) => (
                <li
                  key={`${event.minute}-${event.type}-${index}`}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-pitch-850"
                >
                  <span className="tnum w-7 shrink-0 text-right font-bold text-fg-dim">
                    {event.minute}&apos;
                  </span>
                  <span aria-hidden="true">{EVENT_ICON[event.type]}</span>
                  <span className="truncate font-medium text-fg">
                    {event.player}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-fg-dim">
                    {event.side === "home" ? match.home.short : match.away.short}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mt-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-muted">
          Model prediction
        </h2>
        <PredictionPanel
          prediction={prediction}
          homeLabel={match.home.short}
          awayLabel={match.away.short}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(["home", "away"] as const).map((side) => (
          <div key={side} className="card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fg-muted">
              <TeamCrest team={match[side]} size={20} />
              {match[side].name} lineup
            </h2>
            <ul className="space-y-1">
              {match.lineups[side].map((player) => (
                <li
                  key={`${side}-${player.number}`}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="tnum w-5 text-right text-fg-dim">
                    {player.number}
                  </span>
                  <span className="rounded bg-pitch-800 px-1 py-0.5 text-[9px] font-bold text-fg-dim">
                    {player.position}
                  </span>
                  <span className="truncate text-fg-muted">{player.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
