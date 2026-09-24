import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { usePlayers } from "@/lib/store";
import { PlayerCard } from "@/components/PlayerCard";
import { calcPoints, REGIONS, REGION_FLAG } from "@/lib/tiers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — BlockTiers" },
      { name: "description", content: "Top-ranked Minecraft PvP players by total tier points across all gamemodes." },
      { property: "og:title", content: "Leaderboard — BlockTiers" },
      { property: "og:description", content: "Top-ranked Minecraft PvP players by total tier points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Leaderboard,
});

const PAGE_SIZE = 50;

function Leaderboard() {
  const players = usePlayers();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const [page, setPage] = useState(0);

  const ranked = useMemo(() => {
    return [...players]
      .filter(p => p.ign.toLowerCase().includes(query.toLowerCase()) && (region === "ALL" || p.region === region))
      .sort((a, b) => calcPoints(b) - calcPoints(a));
  }, [players, query, region]);

  const pageCount = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const slice = ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Ranked by total tier points</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Search IGN…" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} className="w-44 bg-secondary/50 border-primary/20" />
          <select value={region} onChange={e => { setRegion(e.target.value); setPage(0); }} className="h-9 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
            <option value="ALL">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{REGION_FLAG[r]} {r}</option>)}
          </select>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold">No players ranked yet</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Once admins add players and assign tiers, the leaderboard fills up here.</p>
          <Link to="/admin"><Button className="gradient-primary text-primary-foreground border-0">Open Admin Panel</Button></Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {slice.map((p, i) => (
              <PlayerCard key={p.uuid} player={p} rank={page * PAGE_SIZE + i + 1} />
            ))}
          </div>
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} / {pageCount}</span>
              <Button variant="secondary" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
