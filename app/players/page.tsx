import { PlayerTable } from "@/components/player-table";
import { PanelCard } from "@/components/ui/panel-card";
import { PLAYERS, getTopRated, getTopScorers } from "@/lib/data/players";

export const metadata = {
  title: "Players — PitchSide",
  description: "Searchable player statistics across Europe's top five leagues.",
};

export default function PlayersPage() {
  const topScorers = getTopScorers(3);
  const topRated = getTopRated(3);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          Player stats
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
          Search, filter and sort the squad database. This table is fed by the
          same dataset as the original Streamlit app — currently a curated
          sample, ready to be swapped for the full 92,671-row file.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <PanelCard title="Top scorers">
          <ul className="space-y-1.5">
            {topScorers.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="tnum w-4 text-[11px] text-fg-dim">
                    {index + 1}
                  </span>
                  <span className="truncate font-semibold text-fg">
                    {player.name}
                  </span>
                  <span className="truncate text-[11px] text-fg-dim">
                    {player.club}
                  </span>
                </span>
                <span className="tnum font-bold text-brand-500">
                  {player.goals}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Highest rated">
          <ul className="space-y-1.5">
            {topRated.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="tnum w-4 text-[11px] text-fg-dim">
                    {index + 1}
                  </span>
                  <span className="truncate font-semibold text-fg">
                    {player.name}
                  </span>
                  <span className="truncate text-[11px] text-fg-dim">
                    {player.club}
                  </span>
                </span>
                <span className="tnum font-bold text-brand-500">
                  {player.rating.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <PlayerTable players={PLAYERS} />
    </div>
  );
}
