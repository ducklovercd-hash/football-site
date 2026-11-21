import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { playerInitials } from "@/lib/format";

/**
 * Player headshot with an honest initials fallback (R-23): when no real photo
 * exists for a player (demo lineups, the sample player set) the avatar shows
 * initials rather than pretending a photo exists. The image is decorative,
 * because the player name is adjacent text (R-39); sizes are fixed by the
 * caller's classes, so a late-loading photo cannot shift layout (R-40).
 */
export function PlayerAvatar({
  name,
  photoUrl,
  className = "size-8",
}: {
  name: string;
  photoUrl?: string;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {photoUrl ? <AvatarImage src={photoUrl} alt="" loading="lazy" /> : null}
      <AvatarFallback className="bg-pitch-700 text-[10px] font-bold text-fg">
        {playerInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
