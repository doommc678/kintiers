import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Player, PlayerStatus, PlayerTier, TierKey, TrialLog, Region } from "./tiers";
import { assertAdminPassword } from "./admin.server";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const listPlayers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPlayer);
});

function rowToPlayer(r: any): Player {
  return {
    uuid: r.uuid,
    ign: r.ign,
    region: r.region as Region,
    status: r.status as PlayerStatus,
    tiers: (r.tiers ?? []) as PlayerTier[],
    trials: (r.trials ?? []) as TrialLog[],
    createdAt: r.created_at,
  };
}

type Action =
  | { type: "add"; ign: string; region: Region; status?: PlayerStatus }
  | { type: "remove"; uuid: string }
  | { type: "updateStatus"; uuid: string; status: PlayerStatus }
  | { type: "setTier"; uuid: string; gamemodeId: string; tier: TierKey; tester?: string; evidenceUrl?: string; notes?: string }
  | { type: "removeTier"; uuid: string; gamemodeId: string };

export const adminMutate = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; action: Action }) => input)
  .handler(async ({ data }) => {
    await assertAdminPassword(data.password);
    const a = data.action;

    if (a.type === "add") {
      const ign = a.ign.trim();
      if (!/^[a-zA-Z0-9_]{2,20}$/.test(ign)) throw new Error("Invalid IGN");
      const { error } = await supabaseAdmin.from("players").insert({
        ign, region: a.region, status: a.status ?? "active", tiers: [], trials: [],
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (a.type === "remove") {
      const { error } = await supabaseAdmin.from("players").delete().eq("uuid", a.uuid);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (a.type === "updateStatus") {
      const { error } = await supabaseAdmin
        .from("players")
        .update({ status: a.status, updated_at: new Date().toISOString() })
        .eq("uuid", a.uuid);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    // Fetch current player for tier ops
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("players").select("*").eq("uuid", a.uuid).maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!row) throw new Error("Player not found");
    const player = rowToPlayer(row);

    if (a.type === "removeTier") {
      const tiers = player.tiers.filter(t => t.gamemodeId !== a.gamemodeId);
      const { error } = await supabaseAdmin.from("players")
        .update({ tiers, updated_at: new Date().toISOString() })
        .eq("uuid", a.uuid);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (a.type === "setTier") {
      const existing = player.tiers.find(t => t.gamemodeId === a.gamemodeId);
      const fromTier = existing?.tier ?? null;
      const newTiers: PlayerTier[] = existing
        ? player.tiers.map(t => t.gamemodeId === a.gamemodeId ? { ...t, tier: a.tier, retired: false } : t)
        : [...player.tiers, { gamemodeId: a.gamemodeId, tier: a.tier }];
      const trial: TrialLog = {
        id: uid(),
        gamemodeId: a.gamemodeId,
        fromTier,
        toTier: a.tier,
        tester: a.tester || "Admin",
        evidenceUrl: a.evidenceUrl,
        notes: a.notes,
        date: new Date().toISOString(),
      };
      const newTrials = [trial, ...player.trials];
      const { error } = await supabaseAdmin.from("players")
        .update({ tiers: newTiers, trials: newTrials, updated_at: new Date().toISOString() })
        .eq("uuid", a.uuid);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    throw new Error("Unknown action");
  });
