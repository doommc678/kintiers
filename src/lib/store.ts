import { useSyncExternalStore } from "react";
import type { Player, PlayerTier, TierKey, TrialLog, Region, PlayerStatus } from "./tiers";

const KEY = "kintiers_v1";
const ADMIN_KEY = "kintiers_admin_v1";
export const ADMIN_PASSWORD = "1029384756#";

type State = {
  players: Player[];
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return { players: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { players: [] };
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePlayers(): Player[] {
  return useSyncExternalStore(subscribe, () => state.players, () => state.players);
}

export function getPlayer(uuid: string): Player | undefined {
  return state.players.find(p => p.uuid === uuid);
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function addPlayer(input: { ign: string; region: Region; status?: PlayerStatus }): Player {
  const player: Player = {
    uuid: uid(),
    ign: input.ign.trim(),
    region: input.region,
    status: input.status ?? "active",
    tiers: [],
    trials: [],
    createdAt: new Date().toISOString(),
  };
  state = { ...state, players: [player, ...state.players] };
  persist();
  return player;
}

export function removePlayer(uuid: string) {
  state = { ...state, players: state.players.filter(p => p.uuid !== uuid) };
  persist();
}

export function updatePlayer(uuid: string, patch: Partial<Player>) {
  state = {
    ...state,
    players: state.players.map(p => p.uuid === uuid ? { ...p, ...patch } : p),
  };
  persist();
}

export function setTier(uuid: string, gamemodeId: string, tier: TierKey, opts?: { tester?: string; evidenceUrl?: string; notes?: string }) {
  const p = getPlayer(uuid);
  if (!p) return;
  const existing = p.tiers.find(t => t.gamemodeId === gamemodeId);
  const fromTier = existing?.tier ?? null;
  const newTiers: PlayerTier[] = existing
    ? p.tiers.map(t => t.gamemodeId === gamemodeId ? { ...t, tier, retired: false } : t)
    : [...p.tiers, { gamemodeId, tier }];
  const trial: TrialLog = {
    id: uid(),
    gamemodeId,
    fromTier,
    toTier: tier,
    tester: opts?.tester || "Admin",
    evidenceUrl: opts?.evidenceUrl,
    notes: opts?.notes,
    date: new Date().toISOString(),
  };
  updatePlayer(uuid, { tiers: newTiers, trials: [trial, ...p.trials] });
}

export function removeTier(uuid: string, gamemodeId: string) {
  const p = getPlayer(uuid);
  if (!p) return;
  updatePlayer(uuid, { tiers: p.tiers.filter(t => t.gamemodeId !== gamemodeId) });
}

export function seedSandbox() {
  if (state.players.length > 0) return;
  const samples: Array<[string, Region, Array<[string, TierKey]>]> = [
    ["EnderKnight", "EU", [["sword","HT1"],["crystal","LT1"],["uhc","HT2"]]],
    ["AxeLord", "NA", [["axe","HT1"],["sword","LT2"],["smp","HT3"]]],
    ["PotMaster", "AS", [["pot","HT1"],["nethpot","LT1"],["diapot","HT2"]]],
    ["DiamondDuke", "EU", [["crystal","HT1"],["diapot","LT1"]]],
    ["MaceKing", "NA", [["mace","HT1"],["cart","HT2"]]],
    ["UHCWizard", "OCE", [["uhc","HT1"],["sword","HT3"]]],
    ["NethGod", "EU", [["nethpot","HT1"],["pot","LT2"]]],
    ["SmpBoss", "SA", [["smp","HT1"],["sword","LT3"]]],
  ];
  for (const [ign, region, tiers] of samples) {
    const p = addPlayer({ ign, region });
    for (const [gm, tier] of tiers) {
      setTier(p.uuid, gm, tier, { tester: "Seed" });
    }
  }
}

// --- admin session ---
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, "1");
    listeners.forEach(l => l());
    return true;
  }
  return false;
}
export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_KEY);
  listeners.forEach(l => l());
}
export function useAdmin(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isAdmin(),
    () => false,
  );
}
