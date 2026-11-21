"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DataSourceBadge } from "@/components/data-source-badge";

export const NAV_SECTIONS = [
  {
    label: "Matchday",
    items: [
      { href: "/", label: "Today" },
      { href: "/live", label: "Live scores" },
      { href: "/standings", label: "Standings" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/predictions", label: "Predictions" },
      { href: "/odds", label: "Odds centre" },
      { href: "/players", label: "Player stats" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-pitch-800 bg-pitch-900 lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-pitch-800 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-black text-black">
          P
        </span>
        <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-fg">
          Pitch<span className="text-brand-500">side</span>
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-dim">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors",
                        active
                          ? "bg-brand-500/10 text-brand-500"
                          : "text-fg-muted hover:bg-pitch-850 hover:text-fg",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          active ? "bg-brand-500" : "bg-pitch-600",
                        ].join(" ")}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-pitch-800 px-4 py-3">
        <DataSourceBadge />
      </div>
    </aside>
  );
}
