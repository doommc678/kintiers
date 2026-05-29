import { Link } from "@tanstack/react-router";
import { calcPoints, GAMEMODES, REGION_FLAG, skinUrl, type Player } from "@/lib/tiers";
import { GamemodeIcon } from "./GamemodeIcon";
import { TierBadge } from "./TierBadge";
import { Crown, Medal, Award } from "lucide-react";

const PODIUM = {
  1: {
    ring: "ring-yellow-400/70",
    glow: "shadow-[0_0_40px_oklch(0.85_0.18_85/0.55)]",
    bar: "from-yellow-400/30 via-yellow-500/10 to-transparent",
    text: "text-yellow-300",
    border: "border-yellow-400/50",
    icon: Crown,
    label: "1st",
  },
  2: {
    ring: "ring-slate-300/70",
    glow: "shadow-[0_0_30px_oklch(0.85_0.02_250/0.45)]",
    bar: "from-slate-300/25 via-slate-400/10 to-transparent",
    text: "text-slate-200",
    border: "border-slate-300/50",
    icon: Medal,
    label: "2nd",
  },
  3: {
    ring: "ring-orange-400/70",
    glow: "shadow-[0_0_30px_oklch(0.72_0.16_50/0.5)]",
    bar: "from-orange-400/25 via-orange-500/10 to-transparent",
    text: "text-orange-300",
    border: "border-orange-400/50",
    icon: Award,
    label: "3rd",
  },
} as const;

export function PlayerCard({ player, rank }: { player: Player; rank?: number }) {
  const banned = player.status === "banned";
  const retired = player.status === "retired";
  const podium = rank && rank <= 3 ? PODIUM[rank as 1 | 2 | 3] : null;
  const Icon = podium?.icon;

  return (
    <Link
      to="/player/$uuid"
      params={{ uuid: player.uuid }}
      className={`relative glass glass-hover rounded-xl p-4 flex gap-4 items-center animate-slide-up overflow-hidden ${podium ? `${podium.glow} border ${podium.border} animate-float-y` : ""}`}
      style={podium ? { animationDelay: `${(rank! - 1) * 120}ms`, animationDuration: rank === 1 ? "3.5s" : "4.5s" } : undefined}
    >
      {/* Podium gradient sheen */}
      {podium && (
        <>
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${podium.bar} opacity-90`} />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -inset-[200%] animate-shine bg-[linear-gradient(115deg,transparent_45%,rgba(255,255,255,0.15)_50%,transparent_55%)]" />
          </div>
        </>
      )}

      {rank !== undefined && (
        <div className={`relative w-10 flex flex-col items-center justify-center ${podium ? podium.text : "text-muted-foreground"}`}>
          {Icon && (
            <div className="relative">
              <div className={`absolute inset-0 blur-md ${podium!.text} opacity-50 animate-pulse-glow`} />
              <Icon className={`relative h-5 w-5 ${rank === 1 ? "animate-float-y" : ""}`} />
            </div>
          )}
          <div className={`text-lg font-extrabold leading-none mt-0.5 ${podium ? "drop-shadow-[0_0_6px_currentColor]" : ""}`}>
            #{rank}
          </div>
        </div>
      )}

      <div className="relative">
        {podium && (
          <div className={`absolute -inset-1 rounded-lg ${podium.ring.replace("ring", "bg").replace("/70", "/30")} blur-md animate-pulse-glow`} />
        )}
        <img
          src={skinUrl(player.ign)}
          alt={player.ign}
          className={`relative h-14 w-14 rounded-lg ring-2 ${podium ? podium.ring : "ring-primary/30"}`}
          loading="lazy"
        />
      </div>

      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate ${banned ? "line-through text-muted-foreground" : ""} ${podium ? podium.text : ""}`}>
            {player.ign}
          </span>
          <span className="text-base">{REGION_FLAG[player.region]}</span>
          {podium && (
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${podium.border} ${podium.text}`}>
              {podium.label}
            </span>
          )}
          {retired && <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-muted-foreground/40 px-1.5 rounded">Retired</span>}
          {banned && <span className="text-[10px] uppercase tracking-wider text-destructive border border-destructive/60 px-1.5 rounded">Banned</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {player.tiers.slice(0, 5).map(t => {
            const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
            return (
              <span key={t.gamemodeId} className="flex items-center gap-1">
                {gm && <GamemodeIcon gm={gm} size={14} />}
                <TierBadge tier={t.tier} size="sm" retired={t.retired} />
              </span>
            );
          })}
          {player.tiers.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No tiers yet</span>
          )}
        </div>
      </div>

      <div className="relative text-right">
        <div className={`text-2xl font-bold ${podium ? podium.text : "gradient-text"} ${podium ? "drop-shadow-[0_0_8px_currentColor]" : ""}`}>
          {calcPoints(player)}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">points</div>
      </div>
    </Link>
  );
}
