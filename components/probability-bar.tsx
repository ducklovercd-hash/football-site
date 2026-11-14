import { formatPct } from "@/lib/format";
import type { Prediction } from "@/lib/types";

export function ProbabilityBar({
  prediction,
  homeLabel,
  awayLabel,
}: {
  prediction: Prediction;
  homeLabel: string;
  awayLabel: string;
}) {
  const segments = [
    {
      key: "home",
      label: homeLabel,
      value: prediction.homeWin,
      className: "bg-brand-500",
    },
    {
      key: "draw",
      label: "Draw",
      value: prediction.draw,
      className: "bg-pitch-600",
    },
    {
      key: "away",
      label: awayLabel,
      value: prediction.awayWin,
      className: "bg-fg-dim",
    },
  ];

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-pitch-800">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${segment.value * 100}%` }}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="flex min-w-0 flex-1 items-center gap-1.5"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${segment.className}`} />
            <span className="truncate text-[11px] text-fg-dim">
              {segment.label}
            </span>
            <span className="tnum ml-auto shrink-0 text-[11px] font-bold text-fg">
              {formatPct(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
