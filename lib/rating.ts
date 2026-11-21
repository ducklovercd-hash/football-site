/**
 * Shared match-rating scale.
 *
 * Reason (R-31): the five tiers are the broadcast rating convention, and the
 * colors are status data like DESIGN.md's semantic states, not brand palette.
 * Every color pairing is WCAG AA verified with the antislop-human formula:
 * white on #dc2626 4.83:1, white on #c2410c 5.18:1, white on #15803d 5.02:1,
 * black on #38bdf8 9.80:1, white on #1d4ed8 6.70:1; the text tints measure
 * 7.11-11.29:1 on the card surface. Tokens live in app/globals.css.
 */
export type RatingTier = "low" | "caution" | "good" | "great" | "elite";

export function ratingTier(rating: number): RatingTier {
  if (rating >= 9) return "elite";
  if (rating >= 8) return "great";
  if (rating >= 7) return "good";
  if (rating >= 6) return "caution";
  return "low";
}

const TIER_BADGE: Record<RatingTier, string> = {
  low: "bg-rating-low text-white",
  caution: "bg-rating-caution text-white",
  good: "bg-rating-good text-white",
  great: "bg-rating-great text-black",
  elite: "bg-rating-elite text-white",
};

const TIER_TEXT: Record<RatingTier, string> = {
  low: "text-rating-low-text",
  caution: "text-rating-caution-text",
  good: "text-rating-good-text",
  great: "text-rating-great-text",
  elite: "text-rating-elite-text",
};

/** Solid badge classes for a rating. Neutral classes when there is no value. */
export function ratingTone(rating: number): string {
  return rating > 0 ? TIER_BADGE[ratingTier(rating)] : "bg-pitch-800 text-fg-muted";
}

/** Text-color classes for a rating on dark surfaces. */
export function ratingTextTone(rating: number): string {
  return rating > 0 ? TIER_TEXT[ratingTier(rating)] : "text-fg-muted";
}
