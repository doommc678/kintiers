import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdmin, usePartners } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Wifi, Trash2, Plus, Server, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPartner, removePartner } from "@/lib/store";
import type { Partner } from "@/lib/partners.functions";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — KinTiers" },
      { name: "description", content: "Partner Minecraft servers featured by the KinTiers community." },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const partners = usePartners();
  const isAdmin = useAdmin();

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Toaster theme="dark" richColors />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" /> Partners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Minecraft servers partnered with KinTiers · live status</p>
        </div>
        {isAdmin && <CreatePartnerDialog />}
      </div>

      {partners.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-slide-up">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold">No partners yet</h3>
          <p className="text-sm text-muted-foreground mt-2">Partner servers will appear here once an admin adds them.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p, i) => (
            <PartnerCard key={p.id} partner={p} isAdmin={isAdmin} delay={i * 80} />
          ))}
        </div>
      )}
    </main>
  );
}

function CreatePartnerDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground border-0 glow-red hover:scale-105 transition">
          <Plus className="h-4 w-4 mr-1" /> Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-primary/30">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">New Partner Server</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !ip.trim()) return;
            setBusy(true);
            try {
              await addPartner(name.trim(), ip.trim());
              toast.success("Partner added");
              setName(""); setIp(""); setOpen(false);
            } catch (err: any) {
              toast.error(err?.message ?? "Failed to add");
            } finally { setBusy(false); }
          }}
        >
          <div>
            <Label>Server Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Shulker MC" maxLength={60} className="mt-1 bg-secondary/50 border-primary/20" />
          </div>
          <div>
            <Label>Server IP / Host</Label>
            <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="play.example.com" maxLength={120} className="mt-1 bg-secondary/50 border-primary/20" />
            <p className="text-[10px] text-muted-foreground mt-1">We'll auto-fetch icon, MOTD, ping and player count.</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="gradient-primary text-primary-foreground border-0 w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Status = {
  online: boolean;
  icon?: string;
  motd?: { clean?: string[] };
  players?: { online: number; max: number };
  version?: string;
  ping?: number;
};

function PartnerCard({ partner, isAdmin, delay }: { partner: Partner; isAdmin: boolean; delay: number }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function fetchStatus() {
    try {
      const url = `https://api.mcsrvstat.us/3/${encodeURIComponent(partner.ip)}`;
      const r = await fetch(url, { cache: "no-store" });
      const d = await r.json();
      let ping: number | undefined;
      try {
        const samples: number[] = [];
        for (let i = 0; i < 2; i++) {
          const t0 = performance.now();
          await fetch(url, { cache: "force-cache" });
          samples.push(performance.now() - t0);
        }
        ping = Math.max(1, Math.round(Math.min(...samples)));
      } catch {}
      setStatus({
        online: !!d.online,
        icon: d.icon,
        motd: d.motd,
        players: d.players,
        version: d.version,
        ping,
      });
    } catch {
      setStatus({ online: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 10000);
    return () => clearInterval(id);
  }, [partner.ip]);

  function copy() {
    navigator.clipboard.writeText(partner.ip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  const online = status?.online;
  const pingColor =
    status?.ping == null ? "text-foreground"
    : status.ping < 120 ? "text-green-400"
    : status.ping < 300 ? "text-yellow-400"
    : "text-red-400";

  return (
    <div className="glass glass-hover rounded-2xl p-5 animate-slide-up relative overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex items-start gap-4">
        {status?.icon ? (
          <img src={status.icon} alt={partner.name} className="h-14 w-14 rounded-xl ring-2 ring-primary/40" />
        ) : (
          <div className="h-14 w-14 rounded-xl gradient-primary grid place-items-center ring-2 ring-primary/40">
            <Server className="h-7 w-7 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold truncate">{partner.name}</h3>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${online ? "border-green-400/40 bg-green-400/10 text-green-400" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
              {loading ? "…" : online ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          <button onClick={copy} className="mt-1 group flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-primary transition">
            <span className="truncate">{partner.ip}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-green-400 shrink-0" /> : <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 shrink-0" />}
          </button>
        </div>
        {isAdmin && (
          <Button
            size="icon" variant="ghost"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={async () => {
              if (!confirm(`Remove ${partner.name}?`)) return;
              try { await removePartner(partner.id); toast.success("Removed"); }
              catch (e: any) { toast.error(e?.message ?? "Failed"); }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {status?.motd?.clean && (
        <p className="relative text-xs text-muted-foreground mt-3 line-clamp-2 italic">
          {status.motd.clean.join(" · ")}
        </p>
      )}

      <div className="relative grid grid-cols-3 gap-2 mt-4">
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="Players" value={online && status?.players ? `${status.players.online}/${status.players.max}` : "—"} />
        <Stat icon={<Wifi className="h-3.5 w-3.5" />} label="Ping" value={status?.ping != null ? `${status.ping}ms` : "—"} className={pingColor} />
        <Stat icon={<Server className="h-3.5 w-3.5" />} label="Version" value={status?.version ? String(status.version).split(" ")[0].slice(0, 8) : "—"} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, className = "" }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 border border-primary/15 px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <div className={`text-xs font-bold mt-0.5 tabular-nums ${className}`}>{value}</div>
    </div>
  );
}

void Link;
