import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdmin, loginAdmin, addPlayer, removePlayer, updatePlayer,
  setTier, removeTier, usePlayers, usePartners,
  addPartner, removePartner, changePassword,
} from "@/lib/store";
import { GAMEMODES, REGIONS, REGION_FLAG, TIER_ORDER, type Region, type TierKey, type PlayerStatus, calcPoints, skinUrl } from "@/lib/tiers";
import { GamemodeIcon } from "@/components/GamemodeIcon";
import { TierBadge } from "@/components/TierBadge";
import { EditionTag, displayIgn } from "@/components/EditionTag";
import { StatusTag } from "@/components/StatusTag";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Shield, UserPlus, ClipboardList, Settings, Handshake, KeyRound,
  Users, Trophy, Loader2, Trash2, Plus, Sparkles, LogIn,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin — BlockTiers" },
    { name: "description", content: "Secure BlockTiers ranking and partner management." },
    { property: "og:title", content: "Admin — BlockTiers" },
    { property: "og:description", content: "Secure BlockTiers management area." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const isLoggedIn = useAdmin();
  return (
    <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
      <Toaster theme="dark" richColors />
      {isLoggedIn ? <Dashboard /> : <LoginCard />}
    </main>
  );
}

function LoginCard() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="relative max-w-sm mx-auto mt-8 sm:mt-16 animate-fade-in">
      <div className="absolute -inset-4 rounded-3xl gradient-primary opacity-30 blur-2xl animate-pulse-glow" />
      <div className="relative glass rounded-2xl p-6 sm:p-8 border border-primary/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl gradient-primary blur-lg opacity-70" />
            <div className="relative h-11 w-11 rounded-xl gradient-primary grid place-items-center"><Shield className="h-6 w-6 text-white" /></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text leading-tight">Admin Access</h1>
            <p className="text-xs text-muted-foreground">Restricted area</p>
          </div>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const ok = await loginAdmin(pw);
            setBusy(false);
            if (ok) toast.success("Welcome, Admin");
            else toast.error("Invalid password");
          }}
        >
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 bg-secondary/50 border-primary/20" />
          </div>
          <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground border-0 glow-red">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4 mr-1" /> Sign in</>}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const players = usePlayers();
  const partners = usePartners();
  const tierCount = players.reduce((s, p) => s + p.tiers.length, 0);

  return (
    <div className="animate-fade-in">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl glass border border-primary/30 p-5 sm:p-6 mb-6">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl gradient-primary blur-md opacity-70 animate-pulse-glow" />
              <div className="relative h-12 w-12 rounded-xl gradient-primary grid place-items-center"><Sparkles className="h-6 w-6 text-white" /></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Command Center</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage players, partners and settings</p>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-2 sm:gap-3 mt-5">
          <Metric icon={<Users className="h-4 w-4" />} label="Players" value={players.length} />
          <Metric icon={<Trophy className="h-4 w-4" />} label="Placements" value={tierCount} />
          <Metric icon={<Handshake className="h-4 w-4" />} label="Partners" value={partners.length} />
        </div>
      </div>

      <Tabs defaultValue="add">
        <TabsList className="bg-secondary/60 w-full flex overflow-x-auto scrollbar-thin justify-start">
          <TabsTrigger value="add" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground gap-1.5"><UserPlus className="h-3.5 w-3.5" />Add Player</TabsTrigger>
          <TabsTrigger value="trial" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Log Trial</TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground gap-1.5"><Settings className="h-3.5 w-3.5" />Manage</TabsTrigger>
          <TabsTrigger value="partners" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground gap-1.5"><Handshake className="h-3.5 w-3.5" />Partners</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground gap-1.5"><KeyRound className="h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6"><AddPlayerForm /></TabsContent>
        <TabsContent value="trial" className="mt-6"><LogTrialForm /></TabsContent>
        <TabsContent value="manage" className="mt-6"><ManagePlayers /></TabsContent>
        <TabsContent value="partners" className="mt-6"><ManagePartners /></TabsContent>
        <TabsContent value="settings" className="mt-6"><ChangePasswordForm /></TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-xl py-3 px-3 text-center border border-primary/15">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="text-xl sm:text-2xl font-bold gradient-text mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function AddPlayerForm() {
  const [ign, setIgn] = useState("");
  const [region, setRegion] = useState<Region>("NA");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="glass rounded-2xl p-5 sm:p-6 max-w-lg space-y-4 animate-slide-up border border-primary/20"
      onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = ign.trim();
        if (!trimmed) return;
        // Allow leading dot for Bedrock prefix
        const checkable = trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
        if (!/^[a-zA-Z0-9_]{2,20}$/.test(checkable)) {
          toast.error("Invalid IGN. Use 2-20 letters/numbers/underscores. Prefix with '.' for Bedrock.");
          return;
        }
        setBusy(true);
        try {
          await addPlayer({ ign: trimmed, region });
          toast.success(`Added ${displayIgn(trimmed)}`);
          setIgn("");
        } catch (err: any) {
          toast.error(err?.message ?? "Failed to add player");
        } finally { setBusy(false); }
      }}
    >
      <h2 className="text-lg font-semibold flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add new player</h2>
      <div>
        <Label>Minecraft IGN <span className="text-[10px] text-muted-foreground">(prefix '.' for Bedrock)</span></Label>
        <Input value={ign} onChange={e => setIgn(e.target.value)} placeholder=".BedrockPlayer or JavaPlayer" maxLength={21} className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Region</Label>
        <select value={region} onChange={e => setRegion(e.target.value as Region)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
          {REGIONS.map(r => <option key={r} value={r}>{REGION_FLAG[r]} {r}</option>)}
        </select>
      </div>
      <Button type="submit" disabled={busy} className="gradient-primary text-primary-foreground border-0 glow-red">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Player"}
      </Button>
    </form>
  );
}

function LogTrialForm() {
  const players = usePlayers();
  const [uuid, setUuid] = useState("");
  const [gm, setGm] = useState(GAMEMODES[1].id);
  const [tier, setTierLocal] = useState<TierKey>("HT3");
  const [tester, setTester] = useState("");
  const [evidence, setEvidence] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="glass rounded-2xl p-5 sm:p-6 max-w-lg space-y-4 animate-slide-up border border-primary/20"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!uuid) return toast.error("Pick a player");
        try {
          await setTier(uuid, gm, tier, { tester: tester || "Admin", evidenceUrl: evidence || undefined, notes: notes || undefined });
          toast.success("Trial logged");
          setEvidence(""); setNotes("");
        } catch (e: any) { toast.error(e?.message ?? "Failed"); }
      }}
    >
      <h2 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Log a trial / set tier</h2>
      {players.length === 0 && <p className="text-sm text-muted-foreground">Add a player first.</p>}
      <div>
        <Label>Player</Label>
        <select value={uuid} onChange={e => setUuid(e.target.value)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
          <option value="">— select —</option>
          {players.map(p => <option key={p.uuid} value={p.uuid}>{displayIgn(p.ign)} ({p.region})</option>)}
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
          <select value={tier} onChange={e => setTierLocal(e.target.value as TierKey)} className="mt-1 w-full h-10 rounded-md bg-secondary/50 border border-primary/20 px-3 text-sm">
            {TIER_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label>Tester name</Label>
        <Input value={tester} onChange={e => setTester(e.target.value)} placeholder="Admin" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Evidence URL</Label>
        <Input value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="https://…" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Notes</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <Button type="submit" className="gradient-primary text-primary-foreground border-0 glow-red">Save Trial</Button>
    </form>
  );
}

function ManagePlayers() {
  const players = usePlayers();
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const list = players.filter(p => displayIgn(p.ign).toLowerCase().includes(query.toLowerCase()));

  if (players.length === 0) {
    return <div className="glass rounded-2xl p-10 text-center text-muted-foreground border border-primary/20">No players yet — add one from the Add Player tab.</div>;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <Input
        placeholder="Search players…"
        value={query} onChange={e => setQuery(e.target.value)}
        className="bg-secondary/50 border-primary/20 max-w-sm"
      />
      <div className="space-y-2">
        {list.map((p, i) => (
          <div key={p.uuid} className="glass rounded-xl border border-primary/15 animate-slide-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
            <div className="flex items-center gap-3 p-3 flex-wrap">
              <img src={skinUrl(p.ign, 64)} alt={p.ign} className="h-10 w-10 rounded ring-1 ring-primary/30" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-semibold ${p.status === "banned" ? "line-through text-muted-foreground" : ""}`}>{displayIgn(p.ign)}</span>
                  <EditionTag ign={p.ign} />
                  <span>{REGION_FLAG[p.region]}</span>
                  <StatusTag status={p.status} />
                  <span className="text-xs text-muted-foreground">· {calcPoints(p)} pts</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.tiers.map(t => {
                    const gm = GAMEMODES.find(g => g.id === t.gamemodeId);
                    return (
                      <span key={t.gamemodeId} className="flex items-center gap-1">
                        {gm && <GamemodeIcon gm={gm} size={14} />}
                        <TierBadge tier={t.tier} size="sm" retired={t.retired} />
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
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
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                  if (confirm(`Remove ${displayIgn(p.ign)}?`)) {
                    try { await removePlayer(p.uuid); toast.success("Removed"); }
                    catch (e: any) { toast.error(e?.message ?? "Failed"); }
                  }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            {open === p.uuid && (
              <div className="border-t border-primary/10 p-3 bg-secondary/20 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GAMEMODES.filter(g => g.id !== "overall").map(gm => {
                    const cur = p.tiers.find(t => t.gamemodeId === gm.id);
                    return (
                      <div key={gm.id} className="flex items-center gap-2 bg-background/40 rounded-lg p-2 border border-primary/10">
                        <span className="w-6 grid place-items-center"><GamemodeIcon gm={gm} size={20} /></span>
                        <span className="text-sm flex-1">{gm.name}</span>
                        <select
                          value={cur?.tier ?? ""}
                          onChange={async e => {
                            const v = e.target.value;
                            try {
                              if (!v) { await removeTier(p.uuid, gm.id); toast.success("Cleared"); }
                              else { await setTier(p.uuid, gm.id, v as TierKey, { tester: "Admin" }); toast.success("Updated"); }
                            } catch (err: any) { toast.error(err?.message ?? "Failed"); }
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
    </div>
  );
}

function ManagePartners() {
  const partners = usePartners();
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fade-in">
      <form
        className="glass rounded-2xl p-5 sm:p-6 space-y-4 border border-primary/20"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !ip.trim()) return;
          setBusy(true);
          try {
            await addPartner(name.trim(), ip.trim());
            toast.success("Partner added");
            setName(""); setIp("");
          } catch (err: any) { toast.error(err?.message ?? "Failed"); }
          finally { setBusy(false); }
        }}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Create partner</h2>
        <div>
          <Label>Server name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Shulker MC" maxLength={60} className="mt-1 bg-secondary/50 border-primary/20" />
        </div>
        <div>
          <Label>Server IP / Host</Label>
          <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="play.example.com" maxLength={120} className="mt-1 bg-secondary/50 border-primary/20" />
        </div>
        <Button type="submit" disabled={busy} className="gradient-primary text-primary-foreground border-0 glow-red w-full sm:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Partner"}
        </Button>
      </form>

      <div className="glass rounded-2xl p-4 sm:p-5 border border-primary/20 max-h-[500px] overflow-y-auto scrollbar-thin">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Existing ({partners.length})</h3>
        {partners.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No partners yet.</p>
        ) : (
          <div className="space-y-2">
            {partners.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-background/40 rounded-lg p-2 border border-primary/10">
                <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center"><Handshake className="h-4 w-4 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground truncate">{p.ip}</div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={async () => {
                  if (!confirm(`Remove ${p.name}?`)) return;
                  try { await removePartner(p.id); toast.success("Removed"); }
                  catch (e: any) { toast.error(e?.message ?? "Failed"); }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="glass rounded-2xl p-5 sm:p-6 max-w-md space-y-4 border border-primary/20 animate-slide-up"
      onSubmit={async (e) => {
        e.preventDefault();
        if (newPw.length < 6) return toast.error("Min 6 characters");
        if (newPw !== confirmPw) return toast.error("Passwords don't match");
        setBusy(true);
        try {
          await changePassword(oldPw, newPw);
          toast.success("Password updated");
          setOldPw(""); setNewPw(""); setConfirmPw("");
        } catch (err: any) {
          toast.error(err?.message ?? "Failed");
        } finally { setBusy(false); }
      }}
    >
      <h2 className="text-lg font-semibold flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Change admin password</h2>
      <p className="text-xs text-muted-foreground">Stored securely on the server. Affects every admin device.</p>
      <div>
        <Label>Current password</Label>
        <Input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>New password</Label>
        <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <div>
        <Label>Confirm new password</Label>
        <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="mt-1 bg-secondary/50 border-primary/20" />
      </div>
      <Button type="submit" disabled={busy} className="gradient-primary text-primary-foreground border-0 glow-red">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
      </Button>
    </form>
  );
}
