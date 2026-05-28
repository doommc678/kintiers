import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GAMEMODES, REGION_FLAG, bodyUrl, calcPoints } from "@/lib/tiers";
import { usePlayers } from "@/lib/store";
import { TierBadge } from "@/components/TierBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/player/$uuid")({
  head: ({ params }) => ({
    meta: [
      { title: `Player — KinTiers` },
      { name: "description", content: `Tier history and trial log for player ${params.uuid}` },
    ],
  }),
  component: PlayerPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Player not found</h1>
      <Link to="/leaderboard" className="text-primary underline mt-4 inline-block">Back to leaderboard</Link>
    </div>
  ),
});

function PlayerPage() {
  const { uuid } = Route.useParams();
  const players = usePlayers();
  const player = players.find(p => p.uuid === uuid);
  if (!player) throw notFound();

  const points = calcPoints(player);
  const banned = player.status === "banned";

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="glass rounded-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex justify-center">
            <img src={bodyUrl(player.ign)} alt={player.ign} className="h-48 rounded-xl bg-secondary/40 p-3" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-4xl font-bold ${banned ? "line-through text-muted-foreground" : "gradient-text"}`}>{player.ign}</h1>
              <span className="text-2xl">{REGION_FLAG[player.region]}</span>
              {player.status === "retired" && <span className="text-xs uppercase tracking-wider text-muted-foreground border border-muted-foreground/40 px-2 py-0.5 rounded">Retired</span>}
              {banned && <span className="text-xs uppercase tracking-wider text-destructive border border-destructive/60 px-2 py-0.5 rounded">Banned</span>}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">Region: {player.region} · Added {new Date(player.createdAt).toLocaleDateString()}</div>

            <div className="mt-5 flex gap-4">
              <div className="glass rounded-xl px-5 py-3">
                <div className="text-3xl font-bold gradient-text">{points}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Points</div>
              </div>
              <div className="glass rounded-xl px-5 py-3">
                <div className="text-3xl font-bold">{player.tiers.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Gamemodes</div>
              </div>
              <div className="glass rounded-xl px-5 py-3">
                <div className="text-3xl font-bold">{player.trials.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trials</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tiers grid */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Tier Placements</h2>
          {player.tiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tiers assigned yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {player.tiers.map(t => {
                const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
                return (
                  <div key={t.gamemodeId} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{gm?.icon}</span>
                      <span className="text-sm font-medium">{gm?.name}</span>
                    </div>
                    <TierBadge tier={t.tier} retired={t.retired} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trial logs */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Trial Log</h2>
          {player.trials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trials recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {player.trials.map(t => {
                const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
                return (
                  <div key={t.id} className="glass rounded-xl p-3 flex flex-wrap items-center gap-3">
                    <span className="text-xl">{gm?.icon}</span>
                    <span className="text-sm font-medium w-20">{gm?.name}</span>
                    <div className="flex items-center gap-2">
                      {t.fromTier ? <TierBadge tier={t.fromTier} size="sm" /> : <span className="text-xs text-muted-foreground italic">new</span>}
                      <span className="text-muted-foreground">→</span>
                      <TierBadge tier={t.toTier} size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground">by {t.tester}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(t.date).toLocaleDateString()}</span>
                    {t.evidenceUrl && (
                      <a href={t.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Evidence ↗</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-2">
          <Link to="/tiers"><Button variant="secondary">← Back to Tiers</Button></Link>
        </div>
      </div>
    </main>
  );
}
