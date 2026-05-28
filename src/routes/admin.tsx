import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdmin, loginAdmin, addPlayer, removePlayer, updatePlayer,
  setTier, removeTier, usePlayers,
} from "@/lib/store";
import { GAMEMODES, REGIONS, REGION_FLAG, TIER_ORDER, type Region, type TierKey, type PlayerStatus, calcPoints, skinUrl } from "@/lib/tiers";
import { TierBadge } from "@/components/TierBadge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — KinTiers" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const isLoggedIn = useAdmin();
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Toaster theme="dark" richColors />
      {isLoggedIn ? <Dashboard /> : <LoginCard />}
    </main>
  );
}

function LoginCard() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="max-w-sm mx-auto mt-12 glass rounded-2xl p-8 animate-fade-in">
      <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
      <p className="text-sm text-muted-foreground mt-1">Enter the admin password to manage tiers.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (loginAdmin(pw)) toast.success("Welcome, Admin");
          else { setErr("Invalid password"); toast.error("Invalid password"); }
        }}
      >
        <div>
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} className="mt-1 bg-secondary/50 border-primary/20" />
          {err && <p className="text-xs text-destructive mt-1">{err}</p>}
        </div>
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Sign in</Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const players = usePlayers();
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">{players.length} player{players.length === 1 ? "" : "s"} · {players.reduce((s,p)=>s+p.tiers.length,0)} tier placements</p>
        </div>
        <Button variant="secondary" onClick={() => { seedSandbox(); toast.success("Sandbox data seeded"); }}>Seed Sandbox</Button>
      </div>

      <Tabs defaultValue="add">
        <TabsList className="bg-secondary/60">
          <TabsTrigger value="add">Add Player</TabsTrigger>
          <TabsTrigger value="trial">Log Trial</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6"><AddPlayerForm /></TabsContent>
        <TabsContent value="trial" className="mt-6"><LogTrialForm /></TabsContent>
        <TabsContent value="manage" className="mt-6"><ManagePlayers /></TabsContent>
      </Tabs>
    </div>
  );
}

function AddPlayerForm() {
  const [ign, setIgn] = useState("");
  const [region, setRegion] = useState<Region>("NA");
  return (
    <form
      className="glass rounded-2xl p-6 max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ign.trim()) return;
        if (!/^[a-zA-Z0-9_]{2,20}$/.test(ign.trim())) {
          toast.error("Invalid IGN format");
          return;
        }
        const p = addPlayer({ ign: ign.trim(), region });
        toast.success(`Added ${p.ign}`);
        setIgn("");
      }}
    >
      <h2 className="text-lg font-semibold">Add new player</h2>
      <div>
        <Label>Minecraft IGN</Label>
        <Input value={ign} onChange={e => setIgn(e.target.value)} placeholder="Notch" maxLength={20} className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Region</Label>
        <select value={region} onChange={e => setRegion(e.target.value as Region)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
          {REGIONS.map(r => <option key={r} value={r}>{REGION_FLAG[r]} {r}</option>)}
        </select>
      </div>
      <Button type="submit" className="gradient-primary text-primary-foreground border-0">Add Player</Button>
    </form>
  );
}

function LogTrialForm() {
  const players = usePlayers();
  const [uuid, setUuid] = useState("");
  const [gm, setGm] = useState(GAMEMODES[1].id);
  const [tier, setTier] = useState<TierKey>("HT3");
  const [tester, setTester] = useState("");
  const [evidence, setEvidence] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="glass rounded-2xl p-6 max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!uuid) return toast.error("Pick a player");
        setTierFn(uuid, gm, tier, { tester: tester || "Admin", evidenceUrl: evidence || undefined, notes: notes || undefined });
        toast.success("Trial logged");
        setEvidence(""); setNotes("");
      }}
    >
      <h2 className="text-lg font-semibold">Log a trial / set tier</h2>
      {players.length === 0 && <p className="text-sm text-muted-foreground">Add a player first.</p>}
      <div>
        <Label>Player</Label>
        <select value={uuid} onChange={e => setUuid(e.target.value)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
          <option value="">— select —</option>
          {players.map(p => <option key={p.uuid} value={p.uuid}>{p.ign} ({p.region})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gamemode</Label>
          <select value={gm} onChange={e => setGm(e.target.value)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
            {GAMEMODES.filter(g => g.id !== "overall").map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Tier</Label>
          <select value={tier} onChange={e => setTier(e.target.value as TierKey)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
            {TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label>Tester name</Label>
        <Input value={tester} onChange={e => setTester(e.target.value)} placeholder="Admin" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Evidence URL (YouTube / Twitch)</Label>
        <Input value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="https://…" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Notes</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <Button type="submit" className="gradient-primary text-primary-foreground border-0">Save Trial</Button>
    </form>
  );
}

// alias to avoid shadowing
const setTierFn = setTier;

function ManagePlayers() {
  const players = usePlayers();
  const [open, setOpen] = useState<string | null>(null);

  if (players.length === 0) {
    return <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No players yet — add one from the Add Player tab.</div>;
  }

  return (
    <div className="space-y-2">
      {players.map(p => (
        <div key={p.uuid} className="glass rounded-xl">
          <div className="flex items-center gap-3 p-3">
            <img src={skinUrl(p.ign, 64)} alt={p.ign} className="h-10 w-10 rounded" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${p.status === "banned" ? "line-through text-muted-foreground" : ""}`}>{p.ign}</span>
                <span>{REGION_FLAG[p.region]}</span>
                <span className="text-xs text-muted-foreground">· {calcPoints(p)} pts</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.tiers.map(t => {
                  const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
                  return (
                    <span key={t.gamemodeId} className="flex items-center gap-1">
                      <span className="text-xs">{gm?.icon}</span>
                      <TierBadge tier={t.tier} size="sm" retired={t.retired} />
                    </span>
                  );
                })}
              </div>
            </div>
            <select
              value={p.status}
              onChange={e => { updatePlayer(p.uuid, { status: e.target.value as PlayerStatus }); toast.success("Status updated"); }}
              className="h-8 rounded-md bg-secondary/50 border border-primary/20 px-2 text-xs"
            >
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="banned">Banned</option>
            </select>
            <Button size="sm" variant="secondary" onClick={() => setOpen(open === p.uuid ? null : p.uuid)}>
              {open === p.uuid ? "Close" : "Edit Tiers"}
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => {
              if (confirm(`Remove ${p.ign}?`)) { removePlayer(p.uuid); toast.success("Removed"); }
            }}>Delete</Button>
          </div>
          {open === p.uuid && (
            <div className="border-t border-primary/10 p-3 bg-secondary/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GAMEMODES.filter(g => g.id !== "overall").map(gm => {
                  const cur = p.tiers.find(t => t.gamemodeId === gm.id);
                  return (
                    <div key={gm.id} className="flex items-center gap-2 bg-background/40 rounded-lg p-2">
                      <span className="text-base w-6">{gm.icon}</span>
                      <span className="text-sm flex-1">{gm.name}</span>
                      <select
                        value={cur?.tier ?? ""}
                        onChange={e => {
                          const v = e.target.value;
                          if (!v) { removeTier(p.uuid, gm.id); toast.success("Cleared"); }
                          else { setTierFn(p.uuid, gm.id, v as TierKey, { tester: "Admin" }); toast.success("Updated"); }
                        }}
                        className="h-8 rounded-md bg-secondary/70 border border-primary/20 px-2 text-xs"
                      >
                        <option value="">—</option>
                        {TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
