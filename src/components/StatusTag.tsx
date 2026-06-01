import type { PlayerStatus } from "@/lib/tiers";

export function StatusTag({ status }: { status: PlayerStatus }) {
  if (status === "banned") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/60 shadow-[0_0_10px_oklch(0.65_0.25_27/0.4)]">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        Banned
      </span>
    );
  }
  if (status === "retired") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/60 shadow-[0_0_10px_oklch(0.85_0.18_85/0.35)]">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
        Retired
      </span>
    );
  }
  return null;
}
