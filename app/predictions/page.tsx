import { PredictionPanel } from "@/components/prediction-panel";
import { TeamCrest } from "@/components/team-crest";
import { PanelCard } from "@/components/ui/panel-card";
import { getMatches } from "@/lib/data/matches";
import { formatKickoff } from "@/lib/format";
import { predictMatch } from "@/lib/model/poisson";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Predictions | PitchSide",
  description:
    "Poisson-model win/draw/loss probabilities, expected goals and scoreline forecasts.",
};

export default function PredictionsPage() {
  const now = new Date();
  const matches = getMatches(now);
  const analysed = matches.map((match) => ({
    match,
    prediction: predictMatch(match),
  }));

  const averageGoals =
    analysed.reduce(
      (total, item) => total + item.prediction.lambdaHome + item.prediction.lambdaAway,
      0,
    ) / Math.max(1, analysed.length);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          Predictions
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
          Every probability below is produced by one Poisson scoreline model,
          not a random number generator. Predictions and odds share the same
          maths, so they can never disagree.
        </p>
      </div>

      <div className="card mb-6 grid gap-4 p-4 sm:grid-cols-3">
        <div>
          <p className="tnum text-xl font-extrabold text-fg">
            {analysed.length}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            Matches modelled
          </p>
        </div>
        <div>
          <p className="tnum text-xl font-extrabold text-brand-500">
            {averageGoals.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            Avg expected goals
          </p>
        </div>
        <div>
          <p className="tnum text-xl font-extrabold text-fg">9</p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            Scorelines per matrix
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {analysed.map(({ match, prediction }) => (
          <PanelCard
            key={match.id}
            title={`${match.home.name} vs ${match.away.name}`}
            subtitle={`${match.competition.name} · ${
              match.status === "SCHEDULED"
                ? formatKickoff(match.kickoff)
                : match.status
            }`}
            actions={<TeamCrest team={match.home} size={18} />}
          >
            <PredictionPanel
              prediction={prediction}
              homeLabel={match.home.short}
              awayLabel={match.away.short}
            />
          </PanelCard>
        ))}
      </div>

      <div className="card mt-6 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-fg-muted">
          How the model works
        </h2>
        <p className="mt-2 text-[11px] leading-relaxed text-fg-dim">
          Each side gets an attack and defence multiplier. Those combine with
          the league averages to give expected goals:{" "}
          <code className="text-brand-500">
            λhome = avgHome × attack(home) × defence(away)
          </code>{" "}
          and the mirror for the away side, with recent form applied as a ±10%
          adjustment. A 9×9 Poisson matrix of scorelines is then summed to get
          1X2 probabilities, over/under, both-teams-to-score and the most likely
          correct score.
        </p>
      </div>
    </div>
  );
}
