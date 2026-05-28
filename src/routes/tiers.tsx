import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { GAMEMODES, REGIONS, REGION_FLAG, TIER_ORDER, calcPoints, skinUrl, type TierKey } from "@/lib/tiers";
import { usePlayers } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

function TiersPage() {
  const { gm } = Route.useSearch();
  const navigate = Route.useNavigate();
  const players = usePlayers();
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

  // Group by tier for tier-row view
  const grouped = useMemo(() => {
    const map = new Map<TierKey, typeof filtered>();
    for (const tk of TIER_ORDER) map.set(tk, []);
    for (const p of filtered) {
      if (isOverall) {
        // pick highest tier across modes
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="glass rounded-xl p-3 sticky top-20">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pb-2">Gamemodes</div>
            <div className="flex md:flex-col gap-1 overflow-x-auto scrollbar-thin">
              {GAMEMODES.map(g => (
                <button
                  key={g.id}
                  onClick={() => navigate({ search: { gm: g.id } })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition w-full text-left ${
                    g.id === activeGm.id
                      ? "gradient-primary text-primary-foreground glow-red"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{g.icon}</span>
                  <span className="font-medium">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">{activeGm.icon}</span>
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
            <EmptyState gm={activeGm.name} />
          ) : (
            <div className="space-y-3">
              {TIER_ORDER.map(tk => {
                const list = grouped.get(tk) ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={tk} className="glass rounded-xl p-4 animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                      <TierBadge tier={tk} size="lg" />
                      <div className="text-xs text-muted-foreground">{list.length} player{list.length === 1 ? "" : "s"}</div>
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {list
                        .sort((a, b) => calcPoints(b) - calcPoints(a))
                        .map(p => (
                          <Link
                            key={p.uuid}
                            to="/player/$uuid"
                            params={{ uuid: p.uuid }}
                            className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary px-3 py-1.5 rounded-lg border border-primary/10 hover:border-primary/40 transition group"
                          >
                            <img src={skinUrl(p.ign, 64)} alt={p.ign} className="h-6 w-6 rounded" />
                            <span className={`text-sm font-medium ${p.status === "banned" ? "line-through text-muted-foreground" : ""}`}>{p.ign}</span>
                            <span className="text-xs">{REGION_FLAG[p.region]}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EmptyState({ gm }: { gm: string }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-xl font-semibold">No {gm} rankings yet</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6">Admins haven't placed any players in this category yet.</p>
      <Link to="/admin"><Button className="gradient-primary text-primary-foreground border-0">Open Admin Panel</Button></Link>
    </div>
  );
}
