export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "live" | "success";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-pitch-800 text-fg-muted",
    brand: "bg-brand-500/15 text-brand-500",
    live: "bg-live/15 text-live",
    success: "bg-emerald-500/15 text-emerald-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
