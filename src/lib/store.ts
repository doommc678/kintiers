import { useEffect, useSyncExternalStore } from "react";
import type { Player, PlayerTier, TierKey, TrialLog, Region, PlayerStatus } from "./tiers";
import { supabase } from "@/integrations/supabase/client";
import { adminMutate, listPlayers } from "./players.functions";
import { verifyAdminPassword, changeAdminPassword } from "./auth.functions";
import { listPartners, addPartner as addPartnerFn, removePartner as removePartnerFn, type Partner } from "./partners.functions";

const ADMIN_KEY = "kintiers_admin_v1";
const ADMIN_PW_KEY = "kintiers_admin_pw_v1";

type State = { players: Player[]; loaded: boolean; partners: Partner[]; partnersLoaded: boolean };

let state: State = { players: [], loaded: false, partners: [], partnersLoaded: false };
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

function rowToPlayer(r: any): Player {
  return {
    uuid: r.uuid,
    ign: r.ign,
    region: r.region,
    status: r.status,
    tiers: r.tiers ?? [],
    trials: r.trials ?? [],
    createdAt: r.created_at,
  };
}

let initStarted = false;
async function init() {
  if (initStarted) return;
  initStarted = true;
  try {
    const [players, partners] = await Promise.all([listPlayers(), listPartners()]);
    setState({ players, loaded: true, partners, partnersLoaded: true });
  } catch (e) {
    console.error("Failed to load data", e);
    setState({ loaded: true, partnersLoaded: true });
  }
  supabase
    .channel("players-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "players" }, (payload) => {
      const evt = payload.eventType;
      if (evt === "INSERT") {
        const p = rowToPlayer(payload.new);
        if (!state.players.find(x => x.uuid === p.uuid)) {
          setState({ players: [p, ...state.players] });
        }
      } else if (evt === "UPDATE") {
        const p = rowToPlayer(payload.new);
        setState({ players: state.players.map(x => x.uuid === p.uuid ? p : x) });
      } else if (evt === "DELETE") {
        const oldUuid = (payload.old as any)?.uuid;
        setState({ players: state.players.filter(x => x.uuid !== oldUuid) });
      }
    })
    .subscribe();

  supabase
    .channel("partners-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "partners" }, async () => {
      try {
        const partners = await listPartners();
        setState({ partners });
      } catch {}
    })
    .subscribe();
}

export function usePlayersInit() {
  useEffect(() => { init(); }, []);
}

export function usePlayers(): Player[] {
  return useSyncExternalStore(subscribe, () => state.players, () => state.players);
}
export function usePlayersLoaded(): boolean {
  return useSyncExternalStore(subscribe, () => state.loaded, () => false);
}
export function usePartners(): Partner[] {
  return useSyncExternalStore(subscribe, () => state.partners, () => state.partners);
}

export function getPlayer(uuid: string): Player | undefined {
  return state.players.find(p => p.uuid === uuid);
}

function pw(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_PW_KEY) ?? "";
}

export async function addPlayer(input: { ign: string; region: Region; status?: PlayerStatus }) {
  await adminMutate({ data: { password: pw(), action: { type: "add", ...input } } });
}
export async function removePlayer(uuid: string) {
  await adminMutate({ data: { password: pw(), action: { type: "remove", uuid } } });
}
export async function updatePlayerStatus(uuid: string, status: PlayerStatus) {
  await adminMutate({ data: { password: pw(), action: { type: "updateStatus", uuid, status } } });
}
export async function setTier(uuid: string, gamemodeId: string, tier: TierKey, opts?: { tester?: string; evidenceUrl?: string; notes?: string }) {
  await adminMutate({ data: { password: pw(), action: { type: "setTier", uuid, gamemodeId, tier, ...opts } } });
}
export async function removeTier(uuid: string, gamemodeId: string) {
  await adminMutate({ data: { password: pw(), action: { type: "removeTier", uuid, gamemodeId } } });
}

export async function addPartner(name: string, ip: string) {
  await addPartnerFn({ data: { password: pw(), name, ip } });
}
export async function removePartner(id: string) {
  await removePartnerFn({ data: { password: pw(), id } });
}
export async function changePassword(oldPassword: string, newPassword: string) {
  await changeAdminPassword({ data: { oldPassword, newPassword } });
  sessionStorage.setItem(ADMIN_PW_KEY, newPassword);
}

export function updatePlayer(uuid: string, patch: Partial<Player>) {
  if (patch.status) return updatePlayerStatus(uuid, patch.status);
  return Promise.resolve();
}

// --- admin session ---
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
export async function loginAdmin(password: string): Promise<boolean> {
  try {
    const { ok } = await verifyAdminPassword({ data: { password } });
    if (!ok) return false;
    sessionStorage.setItem(ADMIN_KEY, "1");
    sessionStorage.setItem(ADMIN_PW_KEY, password);
    listeners.forEach(l => l());
    return true;
  } catch {
    return false;
  }
}
export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(ADMIN_PW_KEY);
  listeners.forEach(l => l());
}
export function useAdmin(): boolean {
  return useSyncExternalStore(subscribe, () => isAdmin(), () => false);
}
