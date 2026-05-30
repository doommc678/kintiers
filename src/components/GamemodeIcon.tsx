import type { Gamemode } from "@/lib/tiers";

/**
 * Renders a gamemode icon: image (blended into theme) if available,
 * else the emoji fallback.
 */
export function GamemodeIcon({
  gm,
  size = 20,
  className = "",
}: {
  gm: Gamemode;
  size?: number;
  className?: string;
}) {
  if (gm.iconImg) {
    return (
      <img
        src={gm.iconImg}
        alt={gm.name}
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className={`object-contain inline-block select-none pointer-events-none ${className}`}
      />
    );
  }
  return (
    <span
      style={{ fontSize: size }}
      className={`inline-block leading-none ${className}`}
      aria-label={gm.name}
    >
      {gm.icon}
    </span>
  );
}
