import { useEffect, useState } from "react";
import { Copy, Check, Wifi, WifiOff, Users, Activity } from "lucide-react";

const SERVER_IP = "play.shulkermc.fun";
const API_URL = `https://api.mcsrvstat.us/3/${SERVER_IP}`;

type Status = {
  online: boolean;
  players?: { online: number; max: number };
  version?: string;
  motd?: { clean?: string[] };
  icon?: string;
  ping?: number;
};

export function ServerStatus({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(0);

  async function fetchStatus() {
    try {
      const r = await fetch(API_URL, { cache: "no-store" });
      const d = await r.json();
      // Measure real network latency with a cached follow-up request
      // (avoids the slow first call where mcsrvstat queries the MC server)
      let ping: number | undefined;
      try {
        const samples: number[] = [];
        for (let i = 0; i < 2; i++) {
          const t0 = performance.now();
          await fetch(API_URL, { cache: "force-cache" });
          samples.push(performance.now() - t0);
        }
        ping = Math.max(1, Math.round(Math.min(...samples)));
      } catch {}
      setStatus({
        online: !!d.online,
        players: d.players,
        version: d.version,
        motd: d.motd,
        icon: d.icon,
        ping,
      });
    } catch {
      setStatus({ online: false });
    } finally {
      setLoading(false);
      setPulse(p => p + 1);
    }
  }

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 20000);
    return () => clearInterval(id);
  }, []);

  function copy() {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  const online = status?.online;
  const players = status?.players;

  if (compact) {
    return (
      <button
        onClick={copy}
        className="glass glass-hover rounded-xl px-4 py-2 flex items-center gap-3 group"
        title="Copy server IP"
      >
        <span className={`relative flex h-2.5 w-2.5`}>
          <span className={`absolute inset-0 rounded-full ${online ? "bg-green-400" : "bg-red-500"} animate-ping opacity-75`} />
          <span className={`relative rounded-full h-2.5 w-2.5 ${online ? "bg-green-400" : "bg-red-500"}`} />
        </span>
        <span className="font-mono text-sm">{SERVER_IP}</span>
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 opacity-60 group-hover:opacity-100" />}
      </button>
    );
  }

  const pingColor =
    status?.ping == null ? "text-foreground"
    : status.ping < 120 ? "text-green-400"
    : status.ping < 300 ? "text-yellow-400"
    : "text-red-400";

  return (
    <div className="relative rounded-2xl p-[1.5px] bg-[conic-gradient(from_0deg,oklch(0.62_0.24_27/0.6),transparent_30%,oklch(0.62_0.24_27/0.6)_60%,transparent_90%)] animate-spin-slow">
      <div className="glass rounded-2xl p-6 relative overflow-hidden bg-card/95">
        {/* animated bg sheen */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -inset-[200%] animate-shine bg-[linear-gradient(115deg,transparent_40%,oklch(0.62_0.24_27/0.25)_50%,transparent_60%)]" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          {/* Icon / pulse */}
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-xl blur-xl ${online ? "bg-green-500/40" : "bg-red-500/40"} animate-pulse-glow`} />
            {status?.icon ? (
              <img src={status.icon} alt="server icon" className="relative h-16 w-16 rounded-xl ring-2 ring-primary/40" />
            ) : (
              <div className="relative h-16 w-16 rounded-xl gradient-primary grid place-items-center ring-2 ring-primary/40">
                <Activity className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Official Tierlist Server</span>
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${online ? "border-green-400/30 bg-green-400/10" : "border-red-500/30 bg-red-500/10"}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inset-0 rounded-full ${online ? "bg-green-400" : "bg-red-500"} animate-ping opacity-75`} />
                  <span className={`relative rounded-full h-2 w-2 ${online ? "bg-green-400" : "bg-red-500"}`} />
                </span>
                <span className={online ? "text-green-400" : "text-red-400"}>
                  {loading ? "CHECKING…" : online ? "LIVE" : "OFFLINE"}
                </span>
              </span>
            </div>

            <button
              onClick={copy}
              className="group flex items-center gap-2 text-xl md:text-2xl font-bold font-mono gradient-text hover:opacity-80 transition"
            >
              {SERVER_IP}
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
              )}
            </button>

            {status?.motd?.clean && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {status.motd.clean.join(" · ")}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-3 md:gap-4">
            <StatTile
              icon={<Users className="h-4 w-4" />}
              label="Players"
              value={online && players ? `${players.online}/${players.max}` : "—"}
              pulse={pulse}
            />
            <StatTile
              icon={online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              label="Ping"
              value={status?.ping != null ? `${status.ping}ms` : "—"}
              pulse={pulse}
              valueClassName={pingColor}
            />
            <StatTile
              icon={<Activity className="h-4 w-4" />}
              label="Version"
              value={status?.version ? String(status.version).split(" ")[0].slice(0, 8) : "—"}
              pulse={pulse}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, pulse, valueClassName = "" }: { icon: React.ReactNode; label: string; value: string; pulse: number; valueClassName?: string }) {
  return (
    <div className="min-w-[78px] rounded-xl bg-secondary/40 border border-primary/15 px-3 py-2 text-center hover:border-primary/40 hover:bg-secondary/60 transition">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <div key={`${label}-${pulse}`} className={`text-sm font-bold mt-0.5 animate-fade-in ${valueClassName}`}>{value}</div>
    </div>
  );
}
