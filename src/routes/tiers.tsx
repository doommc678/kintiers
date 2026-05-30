import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { GAMEMODES, REGIONS, REGION_FLAG, TIER_ORDER, calcPoints, skinUrl, type TierKey, type Player } from "@/lib/tiers";
import { GamemodeIcon } from "@/components/GamemodeIcon";
import { useAdmin, usePlayers } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Crown, Medal, Award } from "lucide-react";

const searchSchema = z.object({
  gm: z.string().optional().default("overall"),
});

export const Route = createFileRoute("/tiers")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Tier Lists — KinTiers" },
      { name: "description", content: "Browse Minecraft PvP tier lists by gamemode. Filter by region, search by IGN." },
    ],
  }),
  component: TiersPage,
});

const PODIUM = {
  1: { ring: "ring-yellow-400/70", text: "text-yellow-300", border: "border-yellow-400/60", bg: "from-yellow-400/20", icon: Crown },
  2: { ring: "ring-slate-300/70", text: "text-slate-200", border: "border-slate-300/60", bg: "from-slate-300/20", icon: Medal },
  3: { ring: "ring-orange-400/70", text: "text-orange-300", border: "border-orange-400/60", bg: "from-orange-400/20", icon: Award },
} as const;

function TiersPage() {
  const { gm } = Route.useSearch();
  const navigate = Route.useNavigate();
  const players = usePlayers();
  const isAdmin = useAdmin();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("ALL");

  const activeGm = GAMEMODES.find(g => g.id === gm) ?? GAMEMODES[0];
  const isOverall = activeGm.id === "overall";

  const filtered = useMemo(() => {
    let list = players.filter(p =>
      p.ign.toLowerCase().includes(query.toLowerCase()) &&
      (region === "ALL" || p.region === region)
    );
    if (!isOverall) {
      list = list.filter(p => p.tiers.some(t => t.gamemodeId === activeGm.id));
    } else {
      list = list.filter(p => p.tiers.length > 0);
    }
    return list;
  }, [players, query, region, activeGm.id, isOverall]);

  const grouped = useMemo(() => {
    const map = new Map<TierKey, Player[]>();
    for (const tk of TIER_ORDER) map.set(tk, []);
    for (const p of filtered) {
      if (isOverall) {
        const best = p.tiers
          .filter(t => !t.retired)
          .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))[0];
        if (best) map.get(best.tier)!.push(p);
      } else {
        const t = p.tiers.find(t => t.gamemodeId === activeGm.id);
        if (t) map.get(t.tier)!.push(p);
      }
    }
    return map;
  }, [filtered, activeGm.id, isOverall]);

  // Compute global rank (1..N) across the active filtered list for podium animations
  const podiumByUuid = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => calcPoints(b) - calcPoints(a));
    const map = new Map<string, 1 | 2 | 3>();
    sorted.slice(0, 3).forEach((p, i) => map.set(p.uuid, (i + 1) as 1 | 2 | 3));
    return map;
  }, [filtered]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Top gamemode tabs */}
      <div className="glass rounded-2xl p-3 mb-6 animate-fade-in">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {GAMEMODES.map(g => (
            <button
              key={g.id}
              onClick={() => navigate({ search: { gm: g.id } })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition shrink-0 ${
                g.id === activeGm.id
                  ? "gradient-primary text-primary-foreground glow-red scale-105"
                  : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <GamemodeIcon gm={g} size={22} />
              <span className="font-medium">{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GamemodeIcon gm={activeGm} size={40} />
            <span>{activeGm.name} Tier List</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} ranked player{filtered.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search IGN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-44 bg-secondary/50 border-primary/20"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-9 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm"
          >
            <option value="ALL">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{REGION_FLAG[r]} {r}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState gm={activeGm.name} isAdmin={isAdmin} />
      ) : (
        <div className="space-y-3">
          {TIER_ORDER.map(tk => {
            const list = grouped.get(tk) ?? [];
            if (list.length === 0) return null;
            const sorted = [...list].sort((a, b) => calcPoints(b) - calcPoints(a));
            return (
              <div key={tk} className="glass rounded-xl p-4 animate-slide-up">
                <div className="flex items-center gap-3 mb-3">
                  <TierBadge tier={tk} size="lg" />
                  <div className="text-xs text-muted-foreground">{list.length} player{list.length === 1 ? "" : "s"}</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {sorted.map(p => {
                    const rank = podiumByUuid.get(p.uuid);
                    const pod = rank ? PODIUM[rank] : null;
                    const Icon = pod?.icon;
                    return (
                      <Link
                        key={p.uuid}
                        to="/player/$uuid"
                        params={{ uuid: p.uuid }}
                        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition group overflow-hidden ${
                          pod
                            ? `bg-secondary/60 hover:bg-secondary ${pod.border} ${pod.ring} ring-1 animate-float-y`
                            : "bg-secondary/60 hover:bg-secondary border-primary/10 hover:border-primary/40"
                        }`}
                        style={pod ? { animationDelay: `${(rank! - 1) * 120}ms`, animationDuration: rank === 1 ? "3.5s" : "4.5s" } : undefined}
                      >
                        {pod && (
                          <>
                            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${pod.bg} via-transparent to-transparent`} />
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                              <div className="absolute -inset-[200%] animate-shine bg-[linear-gradient(115deg,transparent_45%,rgba(255,255,255,0.18)_50%,transparent_55%)]" />
                            </div>
                          </>
                        )}
                        {Icon && (
                          <Icon className={`relative h-3.5 w-3.5 ${pod!.text} ${rank === 1 ? "animate-float-y" : ""} drop-shadow-[0_0_4px_currentColor]`} />
                        )}
                        <img src={skinUrl(p.ign, 64)} alt={p.ign} className={`relative h-6 w-6 rounded ${pod ? `ring-1 ${pod.ring}` : ""}`} />
                        <span className={`relative text-sm font-medium ${p.status === "banned" ? "line-through text-muted-foreground" : ""} ${pod ? pod.text : ""}`}>{p.ign}</span>
                        <span className="relative text-xs">{REGION_FLAG[p.region]}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function EmptyState({ gm, isAdmin }: { gm: string; isAdmin: boolean }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-xl font-semibold">No {gm} rankings yet</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6">No players have been placed in this category yet.</p>
      {isAdmin && (
        <Link to="/admin"><Button className="gradient-primary text-primary-foreground border-0">Open Admin Panel</Button></Link>
      )}
    </div>
  );
}
