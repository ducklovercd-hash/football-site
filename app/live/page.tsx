import { LiveBoard } from "@/components/live-board";
import { getLiveMatches } from "@/lib/data/matches";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live scores — PitchSide",
};

export default function LivePage() {
  const now = new Date();
  const matches = getLiveMatches(now);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          Live now
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
          Scores, minutes and match stats refresh automatically every 15
          seconds. The page keeps the last good snapshot if a refresh fails.
        </p>
      </div>

      <LiveBoard
        initialMatches={matches}
        initialUpdatedAt={now.toISOString()}
      />

      <div className="card mt-6 p-4">
        <p className="text-[11px] leading-relaxed text-fg-dim">
          <span className="font-semibold text-fg-muted">How this stays cheap:</span>{" "}
          the browser polls <code className="text-brand-500">/api/live</code>,
          never the upstream provider. That route is cached on the server, so
          traffic scales without burning API quota. When the real feed is
          connected, the same route becomes the only place that talks to the
          provider.
        </p>
      </div>
    </div>
  );
}
