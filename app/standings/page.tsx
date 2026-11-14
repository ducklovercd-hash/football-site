import { StandingsBoard } from "@/components/standings-board";
import { getAllStandings } from "@/lib/data/standings";

export const metadata = {
  title: "Standings | PitchSide",
  description: "League tables for Europe's top five leagues.",
};

export default function StandingsPage() {
  const data = getAllStandings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          Standings
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
          Full league tables across all five competitions. Switch leagues below;
          the top four, European places and relegation zone are marked on the
          left edge.
        </p>
      </div>

      <StandingsBoard data={data} />
    </div>
  );
}
