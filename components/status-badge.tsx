import type { MatchStatus } from "@/lib/types";

export function StatusBadge({
  status,
  minute,
}: {
  status: MatchStatus;
  minute: number | null;
}) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-live">
        <span className="dot-live h-1.5 w-1.5 rounded-full bg-live" />
        {minute ?? 0}&apos;
      </span>
    );
  }

  if (status === "HT") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-500">
        Half time
      </span>
    );
  }

  if (status === "FT") {
    return (
      <span className="inline-flex items-center rounded-full bg-pitch-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-fg-dim">
        Full time
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-pitch-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
      Upcoming
    </span>
  );
}
