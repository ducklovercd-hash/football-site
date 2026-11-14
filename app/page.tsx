import { LeagueFilter } from "@/components/league-filter";
import { MatchCard } from "@/components/match-card";
import { getMatches } from "@/lib/data/matches";
import { COMPETITIONS } from "@/lib/data/teams";
import { formatLongDay } from "@/lib/format";

export const dynamic = "force-dynamic";

function parseSelection(raw: string | undefined): string[] {
  const all = COMPETITIONS.map((competition) => competition.code);
  if (!raw) return all;
  const requested = raw
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => all.includes(code));
  return requested.length > 0 ? requested : all;
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ comps?: string }>;
}) {
  const params = await searchParams;
  const selected = parseSelection(params.comps);

  const now = new Date();
  const allMatches = getMatches(now);
  const matches = allMatches.filter((match) =>
    selected.includes(match.competition.code),
  );

  const liveCount = matches.filter(
    (match) => match.status === "LIVE" || match.status === "HT",
  ).length;
  const goalsToday = matches.reduce(
    (total, match) => total + (match.score.home ?? 0) + (match.score.away ?? 0),
    0,
  );

  const grouped = COMPETITIONS.filter((competition) =>
    selected.includes(competition.code),
  )
    .map((competition) => ({
      competition,
      matches: matches.filter(
        (match) => match.competition.code === competition.code,
      ),
    }))
    .filter((group) => group.matches.length > 0);

  return (
    <div>
      <section className="pitch-texture card mb-6 overflow-hidden p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500">
              {formatLongDay(now.toISOString())}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
              Today&apos;s matches
            </h1>
            <p className="mt-2 max-w-xl text-sm text-fg-muted">
              Every fixture across Europe&apos;s top five leagues, with scores
              that update as the clock runs.
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="tnum text-2xl font-extrabold text-fg">
                {matches.length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-fg-dim">
                Fixtures
              </p>
            </div>
            <div>
              <p className="tnum text-2xl font-extrabold text-live">
                {liveCount}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-fg-dim">
                Live now
              </p>
            </div>
            <div>
              <p className="tnum text-2xl font-extrabold text-brand-500">
                {goalsToday}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-fg-dim">
                Goals
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <LeagueFilter selected={selected} />
      </div>

      {grouped.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-semibold text-fg">No fixtures found</p>
          <p className="mt-1 text-xs text-fg-dim">
            Try selecting a different league.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.competition.code}>
              <div className="mb-3 flex items-center gap-2">
                <span aria-hidden="true" className="text-base">
                  {group.competition.flag}
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-fg">
                  {group.competition.name}
                </h2>
                <span className="text-[11px] text-fg-dim">
                  {group.competition.country}
                </span>
                <span className="ml-auto text-[11px] text-fg-dim">
                  {group.matches.length} matches
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
