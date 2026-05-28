import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { GAMEMODES, calcPoints } from "@/lib/tiers";
import { usePlayers } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ServerStatus } from "@/components/ServerStatus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KinTiers — Minecraft PvP Tier List" },
      { name: "description", content: "Competitive Minecraft PvP tier rankings across every gamemode — Sword, Crystal, UHC, Pot, SMP, Mace and more. Play on play.shulkermc.fun." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const players = usePlayers();
  const totalTiers = players.reduce((s, p) => s + p.tiers.length, 0);
  const topPoints = players.length ? Math.max(...players.map(calcPoints)) : 0;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl gradient-primary blur-2xl opacity-60 animate-pulse-glow" />
              <img src={logo} alt="KinTiers" className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover ring-4 ring-primary/40" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-slide-up">
            <span className="gradient-text">KinTiers</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "80ms" }}>
            The competitive Minecraft PvP tier list. Trial-tested rankings across every gamemode — built by the community, judged by the best.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <Link to="/tiers"><Button size="lg" className="gradient-primary text-primary-foreground border-0 hover:opacity-90 glow-red">Browse Tier Lists</Button></Link>
            <Link to="/leaderboard"><Button size="lg" variant="secondary">Top Players</Button></Link>
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-xl mx-auto gap-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <Stat label="Gamemodes" value={GAMEMODES.length} />
            <Stat label="Ranked Players" value={players.length} />
            <Stat label="Top Score" value={topPoints} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick a gamemode to see its full tier list</p>
          </div>
          <span className="text-xs text-muted-foreground">{totalTiers} tier placements</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {GAMEMODES.map((gm, i) => {
            const count = players.filter(p => p.tiers.some(t => t.gamemodeId === gm.id)).length;
            return (
              <Link
                key={gm.id}
                to="/tiers"
                search={{ gm: gm.id }}
                className="glass glass-hover rounded-xl p-5 flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="text-4xl mb-2">{gm.icon}</div>
                <div className="font-semibold">{gm.name}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{count} ranked</div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl py-4">
      <div className="text-2xl md:text-3xl font-bold gradient-text">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
