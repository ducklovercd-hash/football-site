"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Date navigation for the fixture list (?date=YYYY-MM-DD). Pure date-string
 * arithmetic in UTC so stepping a day never drifts across timezones.
 */
export function DateNav({ date }: { date: string | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = date ?? todayIso();

  function navigate(next: string | null) {
    const search = new URLSearchParams(params.toString());
    if (next) {
      search.set("date", next);
    } else {
      search.delete("date");
    }
    const comps = search.toString();
    startTransition(() => {
      router.push(comps ? `/?${comps}` : "/", { scroll: false });
    });
  }

  function step(days: number) {
    navigate(shiftIso(current, days));
  }

  const isToday = current === todayIso();

  return (
    <div
      className={[
        "card flex items-center gap-1.5 p-1.5 transition-opacity",
        isPending ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Previous day"
        className="min-h-11 rounded-md px-3 text-xs font-semibold text-fg-muted transition-colors hover:bg-pitch-800 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        ‹ Prev
      </button>

      <input
        type="date"
        value={current}
        onChange={(event) => {
          if (event.target.value) navigate(event.target.value);
        }}
        aria-label="Match date"
        className="tnum min-h-11 rounded-md border border-pitch-700 bg-pitch-900 px-3 text-xs font-semibold text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [color-scheme:dark]"
      />

      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next day"
        className="min-h-11 rounded-md px-3 text-xs font-semibold text-fg-muted transition-colors hover:bg-pitch-800 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Next ›
      </button>

      {!isToday ? (
        <button
          type="button"
          onClick={() => navigate(null)}
          className="min-h-11 rounded-md bg-brand-500 px-3 text-xs font-bold text-black transition-colors hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Today
        </button>
      ) : null}
    </div>
  );
}

function todayIso(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function shiftIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
}
