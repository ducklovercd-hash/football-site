"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today" },
  { href: "/live", label: "Live" },
  { href: "/predictions", label: "Predictions" },
  { href: "/players", label: "Players" },
  { href: "/odds", label: "Odds" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-pitch-800 bg-pitch-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-black text-black">
            P
          </span>
          <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-fg">
            Pitch<span className="text-brand-500">side</span>
          </span>
        </Link>

        <nav className="no-scrollbar -mx-1 flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "relative shrink-0 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "text-brand-500"
                    : "text-fg-muted hover:bg-pitch-850 hover:text-fg",
                ].join(" ")}
              >
                {link.label}
                {active ? (
                  <span className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-full bg-brand-500" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-pitch-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fg-dim sm:flex">
          <span className="dot-live h-1.5 w-1.5 rounded-full bg-brand-500" />
          Demo data
        </span>
      </div>
    </header>
  );
}
