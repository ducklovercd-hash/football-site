import { formatPct } from "@/lib/format";
import { likelyScoreline } from "@/lib/model/poisson";
import type { Prediction } from "@/lib/types";
import { ProbabilityBar } from "./probability-bar";

export function PredictionPanel({
  prediction,
  homeLabel,
  awayLabel,
}: {
  prediction: Prediction;
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <div>
      <ProbabilityBar
        prediction={prediction}
        homeLabel={homeLabel}
        awayLabel={awayLabel}
      />

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-pitch-800 bg-pitch-850/60 p-3">
        <div className="text-center">
          <p className="tnum text-sm font-bold text-fg">
            {prediction.lambdaHome.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            xG home
          </p>
        </div>
        <div className="border-x border-pitch-800 text-center">
          <p className="tnum text-sm font-bold text-brand-500">
            {likelyScoreline(prediction)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            Likely score
          </p>
        </div>
        <div className="text-center">
          <p className="tnum text-sm font-bold text-fg">
            {prediction.lambdaAway.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-fg-dim">
            xG away
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {prediction.topScorelines.slice(0, 4).map((scoreline) => (
          <span
            key={`${scoreline.home}-${scoreline.away}`}
            className="tnum rounded border border-pitch-700 px-2 py-1 text-[11px] text-fg-muted"
          >
            {scoreline.home}-{scoreline.away}
            <span className="ml-1.5 text-fg-dim">
              {formatPct(scoreline.probability, 1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
