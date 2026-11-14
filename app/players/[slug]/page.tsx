import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelCard } from "@/components/ui/panel-card";
import { PLAYERS, getPlayerBySlug } from "@/lib/data/players";

export function generateStaticParams() {
  return PLAYERS.map((player) => ({ slug: player.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  if (!player) return { title: "Player not found — PitchSide" };
  return {
    title: `${player.name} — PitchSide`,
    description: `${player.name}, ${player.position} at ${player.club}. ${player.goals} goals and ${player.assists} assists this season.`,
  };
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-pitch-800 bg-pitch-850/60 p-3 text-center">
      <p className="tnum text-lg font-extrabold text-fg">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-fg-dim">{label}</p>
    </div>
  );
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);
  if (!player) notFound();

  const goalsPer90 =
    player.minutes > 0 ? (player.goals / player.minutes) * 90 : 0;
  const assistsPer90 =
    player.minutes > 0 ? (player.assists / player.minutes) * 90 : 0;

  return (
    <div>
      <Link
        href="/players"
        className="text-[11px] font-semibold uppercase tracking-wider text-fg-dim hover:text-brand-500"
      >
        ← All players
      </Link>

      <div className="pitch-texture card mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500">
              {player.position} · {player.competition}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-fg">
              {player.name}
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              {player.club} · {player.nationality} · {player.age} years
            </p>
          </div>

          <div className="text-right">
            <p className="tnum text-3xl font-extrabold text-brand-500">
              {player.rating.toFixed(2)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-fg-dim">
              Season rating
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Appearances" value={player.appearances} />
        <StatTile label="Minutes" value={player.minutes.toLocaleString("en-GB")} />
        <StatTile label="Goals" value={player.goals} />
        <StatTile label="Assists" value={player.assists} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PanelCard title="Per 90 minutes">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-dim">Goals / 90</span>
              <span className="tnum font-semibold text-fg">
                {goalsPer90.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-dim">Assists / 90</span>
              <span className="tnum font-semibold text-fg">
                {assistsPer90.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-dim">Goal contributions</span>
              <span className="tnum font-semibold text-fg">
                {player.goals + player.assists}
              </span>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Profile">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-dim">Height</span>
              <span className="tnum font-semibold text-fg">
                {player.height} cm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-dim">Preferred foot</span>
              <span className="font-semibold text-fg">{player.foot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-dim">Contract expires</span>
              <span className="tnum font-semibold text-fg">
                {player.contractExpires}
              </span>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
