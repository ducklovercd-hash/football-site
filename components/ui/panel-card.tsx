import type { ReactNode } from "react";

/**
 * Card with a header row — the TailAdmin "card with title/actions" pattern,
 * restyled for the black & yellow theme.
 */
export function PanelCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-pitch-800 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold uppercase tracking-wider text-fg-muted">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 truncate text-[11px] text-fg-dim">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
