import { LoadingState } from "@/components/ui/data-states";

export default function Loading() {
  return (
    <div>
      <div className="card mb-6 h-[104px] animate-pulse bg-pitch-850/60" />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-24 animate-pulse rounded-full bg-pitch-850/60"
          />
        ))}
      </div>
      <div className="card h-[380px] animate-pulse bg-pitch-850/60" />
      <div className="mt-3">
        <LoadingState rows={1} />
      </div>
    </div>
  );
}
