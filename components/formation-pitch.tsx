import { PlayerAvatar } from "@/components/player-avatar";
import { RatingBadge } from "@/components/primitives/rating-badge";
import { shortPlayerName } from "@/lib/format";
import type { Position, TeamLineup } from "@/lib/types";

/**
 * Formation grid.
 *
 * The formation string ("4-3-3") is parsed into row counts, which are then
 * laid out back-to-front over a pitch. Rows are rendered defensively so any
 * formation string degrades gracefully instead of overflowing.
 */
function rowsFromFormation(formation: string): number[] {
  const parts = formation
    .split("-")
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  // Sum of outfield rows must be 10 (11 players minus the keeper).
  const total = parts.reduce((sum, value) => sum + value, 0);
  if (total === 10) return parts;
  return [4, 3, 3];
}

const ROW_LABEL: Record<Position, string> = {
  GK: "GK",
  DF: "DEF",
  MF: "MID",
  FW: "ATT",
};

function PlayerChip({
  player,
  compact,
}: {
  player: TeamLineup["players"][number];
  compact: boolean;
}) {
  return (
    <div className="flex w-16 flex-col items-center gap-1 text-center">
      <span className="relative flex flex-col items-center">
        <PlayerAvatar
          name={player.name}
          photoUrl={player.photoUrl}
          className="size-9"
        />
        <RatingBadge rating={player.rating} className="mt-1" />
      </span>
      {compact ? null : (
        <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-fg-muted">
          <span className="tnum text-fg-dim">{player.number}</span>{" "}
          {shortPlayerName(player.name)}
        </span>
      )}
      <span className="sr-only">
        {player.name}, {ROW_LABEL[player.position]}, rating{" "}
        {player.rating.toFixed(1)}
      </span>
    </div>
  );
}

export function FormationPitch({
  lineup,
  teamName,
  teamColor,
  compact = false,
}: {
  lineup: TeamLineup;
  teamName: string;
  teamColor: string;
  compact?: boolean;
}) {
  const formation = rowsFromFormation(lineup.formation);
  const goalkeeper = lineup.players.find((player) => player.position === "GK");
  const outfield = lineup.players.filter((player) => player.position !== "GK");

  // Slice the outfield list into rows, defending against short lineups.
  const rows: (typeof outfield)[] = [];
  let cursor = 0;
  for (const count of formation) {
    rows.push(outfield.slice(cursor, cursor + count));
    cursor += count;
  }
  if (cursor < outfield.length) {
    rows[rows.length - 1] = [...rows[rows.length - 1], ...outfield.slice(cursor)];
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          {teamName}
        </span>
        <span className="rounded bg-pitch-800 px-1.5 py-0.5 text-[10px] font-bold text-fg-muted">
          {lineup.formation}
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-pitch-800"
        style={{
          background:
            "repeating-linear-gradient(180deg, #0d1a10 0 42px, #0f2013 42px 84px)",
        }}
      >
        {/* pitch markings */}
        <div className="pointer-events-none absolute inset-2 rounded border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute inset-x-6 top-2 h-10 rounded-b border border-white/10" />
        <div className="pointer-events-none absolute inset-x-6 bottom-2 h-10 rounded-t border border-white/10" />

        <div className="relative flex flex-col gap-4 px-2 py-5">
          {/* attacking rows first (top of the pitch) */}
          {rows
            .slice()
            .reverse()
            .map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex items-center justify-center gap-1"
              >
                {row.map((player) => (
                  <PlayerChip
                    key={`${player.number}-${player.name}`}
                    player={player}
                    compact={compact}
                  />
                ))}
              </div>
            ))}

          {goalkeeper ? (
            <div className="flex items-center justify-center">
              <PlayerChip player={goalkeeper} compact={compact} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
