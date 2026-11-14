import { LoadingState } from "@/components/ui/data-states";

/**
 * R-27: the streaming fallback while the fixture list is prepared, so the page
 * never appears frozen and reserved space prevents a layout shift.
 */
export default function Loading() {
  return (
    <div>
      <div className="card mb-6 h-[132px] animate-pulse bg-pitch-850/60" />
      <LoadingState rows={3} />
    </div>
  );
}
