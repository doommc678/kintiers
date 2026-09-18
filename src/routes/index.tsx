import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { GAMEMODES, calcPoints } from "@/lib/tiers";
import { GamemodeIcon } from "@/components/GamemodeIcon";
import { usePlayers } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ServerStatus } from "@/components/ServerStatus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KinTiers — Minecraft PvP Tier List" },
      { name: "description", content: "Competitive Minecraft PvP tier rankings across every gamemode — Sword, Crystal, UHC, Spear, SMP, Mace and more. Play on play.blockmc.xyz." },
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
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 py-16 md:py-24 text-center relative">
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative animate-float-y">
              <div className="absolute -inset-2 rounded-2xl gradient-primary blur-2xl opacity-60 animate-pulse-glow" />
              <div className="absolute -inset-4 rounded-3xl border border-primary/30 animate-spin-slow" />
              <img src={logo} alt="KinTiers" className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover ring-4 ring-primary/40" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-slide-up">
            <span className="gradient-text animate-gradient-shift bg-[linear-gradient(135deg,oklch(0.85_0.15_25),oklch(0.65_0.25_27),oklch(0.85_0.15_25))] bg-clip-text text-transparent">
              KinTiers
            </span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "80ms" }}>
            The competitive Minecraft PvP tier list. Trial-tested rankings across every gamemode — built by the community, judged by the best.
          </p>

          {/* Server status */}
          <div className="mt-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "120ms" }}>
            <ServerStatus />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link to="/tiers"><Button size="lg" className="gradient-primary text-primary-foreground border-0 hover:opacity-90 glow-red hover:scale-105 transition">Browse Tier Lists</Button></Link>
            <Link to="/leaderboard"><Button size="lg" variant="secondary" className="hover:scale-105 transition">Top Players</Button></Link>
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-xl mx-auto gap-4 animate-slide-up" style={{ animationDelay: "280ms" }}>
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
                <div className="mb-2 h-10 w-10 grid place-items-center">
                  <GamemodeIcon gm={gm} size={40} />
                </div>
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
