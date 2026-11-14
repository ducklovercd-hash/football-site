export function StatBar({
  label,
  home,
  away,
  suffix = "",
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}) {
  const total = home + away;
  const homeShare = total === 0 ? 50 : (home / total) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="tnum text-xs font-bold text-fg">
          {home}
          {suffix}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-fg-dim">
          {label}
        </span>
        <span className="tnum text-xs font-bold text-fg">
          {away}
          {suffix}
        </span>
      </div>
      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-pitch-800">
        <div
          className="bg-brand-500 transition-[width] duration-500"
          style={{ width: `${homeShare}%` }}
        />
        <div
          className="bg-pitch-600 transition-[width] duration-500"
          style={{ width: `${100 - homeShare}%` }}
        />
      </div>
    </div>
  );
}
