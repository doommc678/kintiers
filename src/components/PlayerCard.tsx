import { Link } from "@tanstack/react-router";
import { calcPoints, GAMEMODES, REGION_FLAG, skinUrl, type Player } from "@/lib/tiers";
import { TierBadge } from "./TierBadge";

export function PlayerCard({ player, rank }: { player: Player; rank?: number }) {
  const banned = player.status === "banned";
  const retired = player.status === "retired";
  return (
    <Link
      to="/player/$uuid"
      params={{ uuid: player.uuid }}
      className="glass glass-hover rounded-xl p-4 flex gap-4 items-center animate-slide-up"
    >
      {rank !== undefined && (
        <div className="text-xl font-bold text-muted-foreground w-8 text-center">#{rank}</div>
      )}
      <img
        src={skinUrl(player.ign)}
        alt={player.ign}
        className="h-14 w-14 rounded-lg ring-2 ring-primary/30"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate ${banned ? "line-through text-muted-foreground" : ""}`}>{player.ign}</span>
          <span className="text-base">{REGION_FLAG[player.region]}</span>
          {retired && <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-muted-foreground/40 px-1.5 rounded">Retired</span>}
          {banned && <span className="text-[10px] uppercase tracking-wider text-destructive border border-destructive/60 px-1.5 rounded">Banned</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {player.tiers.slice(0, 5).map(t => {
            const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
            return (
              <span key={t.gamemodeId} className="flex items-center gap-1">
                <span className="text-xs">{gm?.icon}</span>
                <TierBadge tier={t.tier} size="sm" retired={t.retired} />
              </span>
            );
          })}
          {player.tiers.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No tiers yet</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold gradient-text">{calcPoints(player)}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">points</div>
      </div>
    </Link>
  );
}
