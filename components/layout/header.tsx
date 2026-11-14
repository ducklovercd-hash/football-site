"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./sidebar";

const LABELS: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((section) => section.items).map((item) => [
    item.href,
    item.label,
  ]),
);

function crumbFor(pathname: string): { href: string; label: string } {
  if (pathname.startsWith("/matches/")) {
    return { href: "/matches", label: "Match detail" };
  }
  if (pathname.startsWith("/players/")) {
    return { href: "/players", label: "Player profile" };
  }
  const match = Object.keys(LABELS)
    .filter((href) => href !== "/")
    .find((href) => pathname.startsWith(href));
  return { href: pathname, label: match ? LABELS[match] : "Today" };
}

/** TailAdmin-style breadcrumb header + mobile nav rail. */
export function Header() {
  const pathname = usePathname();
  const crumb = crumbFor(pathname);
  const isHome = crumb.label === "Today" && pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-pitch-800 bg-pitch-950/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-black text-black">
            P
          </span>
          <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-fg">
            Pitch<span className="text-brand-500">side</span>
          </span>
        </Link>

        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-2 text-[12px] lg:flex"
        >
          <Link href="/" className="text-fg-dim hover:text-brand-500">
            Home
          </Link>
          {!isHome ? (
            <>
              <span className="text-pitch-600">/</span>
              <span className="font-semibold text-fg">{crumb.label}</span>
            </>
          ) : (
            <>
              <span className="text-pitch-600">/</span>
              <span className="font-semibold text-fg">Today</span>
            </>
          )}
        </nav>

        {/* Mobile nav rail */}
        <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto lg:hidden">
          {NAV_SECTIONS.flatMap((section) => section.items).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-fg-muted hover:text-fg",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-pitch-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fg-dim sm:flex">
          <span className="dot-live h-1.5 w-1.5 rounded-full bg-brand-500" />
          Demo data
        </span>
      </div>
    </header>
  );
}
