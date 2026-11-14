import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500">
        404
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-fg">
        Off the pitch
      </h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        That page doesn&apos;t exist. It may have been a fixture that has since
        rolled off the schedule.
      </p>
      <Link
        href="/"
        className="mt-5 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-black transition-opacity hover:opacity-90"
      >
        Back to today&apos;s matches
      </Link>
    </div>
  );
}
