"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { COMPETITIONS } from "@/lib/data/teams";

/**
 * Filter state lives in the URL (?comps=PL,SA) so it is shareable,
 * survives refresh, and lets the server render the filtered list.
 */
export function LeagueFilter({ selected }: { selected: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function apply(next: string[]) {
    const params = new URLSearchParams();
    if (next.length > 0 && next.length < COMPETITIONS.length) {
      params.set("comps", next.join(","));
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function toggle(code: string) {
    apply(
      selected.includes(code)
        ? selected.filter((item) => item !== code)
        : [...selected, code],
    );
  }

  const allActive = selected.length === COMPETITIONS.length;

  return (
    <div
      className={[
        "no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 transition-opacity",
        isPending ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => apply([])}
        className={[
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          allActive
            ? "bg-brand-500 text-black"
            : "border border-pitch-700 text-fg-muted hover:border-brand-700 hover:text-fg",
        ].join(" ")}
      >
        All leagues
      </button>

      {COMPETITIONS.map((competition) => {
        const active = selected.includes(competition.code);
        return (
          <button
            key={competition.code}
            type="button"
            onClick={() => toggle(competition.code)}
            aria-pressed={active}
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-brand-500 text-black"
                : "border border-pitch-700 text-fg-muted hover:border-brand-700 hover:text-fg",
            ].join(" ")}
          >
            <span aria-hidden="true">{competition.flag}</span>
            {competition.name}
          </button>
        );
      })}
    </div>
  );
}
