import type { FormResult } from "@/lib/types";

/** W/D/L pills, matching the row-level form column in TailAdmin tables. */
export function FormPills({ form, size = "sm" }: { form: FormResult[]; size?: "sm" | "md" }) {
  const dimension = size === "md" ? "h-5 w-5 text-[10px]" : "h-4 w-4 text-[9px]";

  return (
    <span className="flex items-center gap-1">
      {form.map((result, index) => (
        <span
          key={index}
          title={result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
          className={[
            "flex items-center justify-center rounded-[3px] font-bold",
            dimension,
            result === "W"
              ? "bg-emerald-500/20 text-emerald-400"
              : result === "D"
                ? "bg-pitch-700 text-fg-muted"
                : "bg-live/20 text-live",
          ].join(" ")}
        >
          {result}
        </span>
      ))}
    </span>
  );
}
