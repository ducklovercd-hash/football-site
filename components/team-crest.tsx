"use client";

import { useEffect, useRef, useState } from "react";
import type { Team } from "@/lib/types";

function readableText(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

export function TeamCrest({ team, size = 34 }: { team: Team; size?: number }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight"
        style={{
          width: size,
          height: size,
          fontSize: Math.max(9, size * 0.29),
          backgroundColor: team.color,
          color: readableText(team.color),
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {team.short.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      ref={imgRef}
      src={`/crests/${team.id}.png`}
      alt={`${team.name} club crest`}
      width={size}
      height={size}
      decoding="async"
      onError={() => setFailed(true)}
      className="inline-block shrink-0 object-contain"
    />
  );
}
