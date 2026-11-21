import { ratingTone } from "@/lib/rating";

/**
 * Colored match-rating badge.
 *
 * Reason (R-31): solid, badge-shaped ratings match the broadcast style and
 * keep the digit as the weight-carrying element. Colors come from the shared
 * AA-verified scale in lib/rating.ts. A missing rating (0) renders an honest
 * dash on a neutral chip instead of a fake value (R-38).
 */
export function RatingBadge({
  rating,
  decimals = 1,
  className = "",
}: {
  rating: number;
  decimals?: number;
  className?: string;
}) {
  return (
    <span
      className={`tnum inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${ratingTone(rating)} ${className}`}
    >
      {rating > 0 ? rating.toFixed(decimals) : "\u2013"}
    </span>
  );
}
