import type { ReactNode } from "react";

/**
 * The three data states R-27 requires, in one place so every data view can
 * ship empty, loading and error views instead of only the happy path.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-fg-dim">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card border-live/40 p-6 text-center">
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-fg-dim">{description}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-pitch-700 px-3 py-2 text-xs font-semibold text-fg transition-colors hover:border-brand-700"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** Skeleton with reserved space, so late content never shifts the layout. */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading data</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card h-[92px] animate-pulse bg-pitch-850/60" />
      ))}
    </div>
  );
}
