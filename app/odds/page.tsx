import { formatKickoff, formatOdds, formatPct } from "@/lib/format";
import { getMatches } from "@/lib/data/matches";
import { matchOdds, predictMatch } from "@/lib/model/poisson";
import { PanelCard } from "@/components/ui/panel-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Odds — PitchSide",
  description: "Model-implied 1X2, over/under and BTTS odds.",
};

function OddsBox({
  label,
  odds,
  probability,
  highlight,
}: {
  label: string;
  odds: number;
  probability: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border p-2.5 text-center",
        highlight
          ? "border-brand-700 bg-brand-500/10"
          : "border-pitch-800 bg-pitch-850/60",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-dim">
        {label}
      </p>
      <p
        className={[
          "tnum mt-1 text-base font-extrabold",
          highlight ? "text-brand-500" : "text-fg",
        ].join(" ")}
      >
        {formatOdds(odds)}
      </p>
      <p className="tnum text-[10px] text-fg-dim">{formatPct(probability)}</p>
    </div>
  );
}

export default function OddsPage() {
  const now = new Date();
  const rows = getMatches(now).map((match) => {
    const prediction = predictMatch(match);
    return { match, prediction, odds: matchOdds(prediction) };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          Odds centre
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
          Decimal odds derived from the model&apos;s probabilities with a 6%
          overround applied — the same margin structure a bookmaker uses. These
          are model-implied prices, not live market prices.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map(({ match, prediction, odds }) => {
          const best = Math.max(
            prediction.homeWin,
            prediction.draw,
            prediction.awayWin,
          );

          return (
            <PanelCard
              key={match.id}
              title={`${match.home.name} vs ${match.away.name}`}
              subtitle={match.competition.name}
              actions={
                <span className="tnum text-[11px] text-fg-dim">
                  {match.status === "SCHEDULED"
                    ? formatKickoff(match.kickoff)
                    : `${match.status} ${match.score.home ?? 0}-${match.score.away ?? 0}`}
                </span>
              }
            >
              <div className="grid gap-2 sm:grid-cols-3">
                <OddsBox
                  label={`${match.home.short} win`}
                  odds={odds.home}
                  probability={prediction.homeWin}
                  highlight={prediction.homeWin === best}
                />
                <OddsBox
                  label="Draw"
                  odds={odds.draw}
                  probability={prediction.draw}
                  highlight={prediction.draw === best}
                />
                <OddsBox
                  label={`${match.away.short} win`}
                  odds={odds.away}
                  probability={prediction.awayWin}
                  highlight={prediction.awayWin === best}
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <OddsBox
                  label="Over 2.5"
                  odds={odds.over25}
                  probability={prediction.over25}
                />
                <OddsBox
                  label="Under 2.5"
                  odds={odds.under25}
                  probability={1 - prediction.over25}
                />
                <OddsBox
                  label="BTTS yes"
                  odds={odds.bttsYes}
                  probability={prediction.btts}
                />
                <OddsBox
                  label="BTTS no"
                  odds={odds.bttsNo}
                  probability={1 - prediction.btts}
                />
              </div>
            </PanelCard>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-fg-dim">
        Reminder: these are model outputs for analysis only, not betting advice.
        Bookmaker odds are usually tighter than model-implied prices.
      </p>
    </div>
  );
}
