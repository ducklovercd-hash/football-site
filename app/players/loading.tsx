import { LoadingState } from "@/components/ui/data-states";

export default function Loading() {
  return (
    <div>
      <div className="card mb-6 h-[120px] animate-pulse bg-pitch-850/60" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="card h-[150px] animate-pulse bg-pitch-850/60" />
        <div className="card h-[150px] animate-pulse bg-pitch-850/60" />
      </div>
      <LoadingState rows={4} />
    </div>
  );
}
