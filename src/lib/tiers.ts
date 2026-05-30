import swordImg from "@/assets/gamemodes/sword.webp";
import axeImg from "@/assets/gamemodes/axe.png";
import uhcImg from "@/assets/gamemodes/uhc.webp";
import crystalImg from "@/assets/gamemodes/crystal.gif";
import smpImg from "@/assets/gamemodes/smp.png";
import nethpotImg from "@/assets/gamemodes/nethpot_t.png";
import diapotImg from "@/assets/gamemodes/diapot.png";
import cartImg from "@/assets/gamemodes/cart.png";
import maceImg from "@/assets/gamemodes/mace.jpg";
import spearImg from "@/assets/gamemodes/spear.png";

export type TierKey =
  | "HT1" | "LT1" | "HT2" | "LT2" | "HT3"
  | "LT3" | "HT4" | "LT4" | "HT5" | "LT5";

export const TIER_ORDER: TierKey[] = ["HT1","LT1","HT2","LT2","HT3","LT3","HT4","LT4","HT5","LT5"];

export const TIER_POINTS: Record<TierKey, number> = {
  HT1: 60, LT1: 45, HT2: 30, LT2: 20, HT3: 15,
  LT3: 10, HT4: 6, LT4: 4, HT5: 2, LT5: 1,
};

export const TIER_COLOR_CLASS: Record<TierKey, string> = {
  HT1: "bg-tier-ht1 text-black",
  LT1: "bg-tier-lt1 text-black",
  HT2: "bg-tier-ht2 text-black",
  LT2: "bg-tier-lt2 text-black",
  HT3: "bg-tier-ht3 text-black",
  LT3: "bg-tier-lt3 text-black",
  HT4: "bg-tier-ht4 text-white",
  LT4: "bg-tier-lt4 text-white",
  HT5: "bg-tier-ht5 text-white",
  LT5: "bg-tier-lt5 text-white",
};

export const REGIONS = ["NA", "EU", "AS", "SA", "OCE", "AF"] as const;
export type Region = typeof REGIONS[number];

export const REGION_FLAG: Record<Region, string> = {
  NA: "🇺🇸", EU: "🇪🇺", AS: "🇮🇳", SA: "🇧🇷", OCE: "🇦🇺", AF: "🇿🇦",
};

export type Gamemode = {
  id: string;
  name: string;
  icon: string;       // emoji fallback / overall
  iconImg?: string;   // image asset for the gamemode
};

export const GAMEMODES: Gamemode[] = [
  { id: "overall", name: "Overall", icon: "🏆" },
  { id: "sword", name: "Sword", icon: "⚔️", iconImg: swordImg },
  { id: "axe", name: "Axe", icon: "🪓", iconImg: axeImg },
  { id: "uhc", name: "UHC", icon: "🍎", iconImg: uhcImg },
  { id: "crystal", name: "Crystal", icon: "💎", iconImg: crystalImg },
  { id: "spear", name: "Spear", icon: "🔱", iconImg: spearImg },
  { id: "smp", name: "SMP", icon: "🏹", iconImg: smpImg },
  { id: "nethpot", name: "Neth Pot", icon: "🔥", iconImg: nethpotImg },
  { id: "diapot", name: "Dia Pot", icon: "💠", iconImg: diapotImg },
  { id: "cart", name: "Cart", icon: "🛒", iconImg: cartImg },
  { id: "mace", name: "Mace", icon: "🔨", iconImg: maceImg },
];

export type PlayerStatus = "active" | "retired" | "banned";

export type TrialLog = {
  id: string;
  gamemodeId: string;
  fromTier: TierKey | null;
  toTier: TierKey;
  tester: string;
  evidenceUrl?: string;
  notes?: string;
  date: string; // ISO
};

export type PlayerTier = {
  gamemodeId: string;
  tier: TierKey;
  retired?: boolean;
};

export type Player = {
  uuid: string;
  ign: string;
  region: Region;
  status: PlayerStatus;
  tiers: PlayerTier[];
  trials: TrialLog[];
  createdAt: string;
};

export function calcPoints(p: Player): number {
  return p.tiers
    .filter(t => !t.retired)
    .reduce((sum, t) => sum + (TIER_POINTS[t.tier] ?? 0), 0);
}

export function skinUrl(ign: string, size = 160) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(ign)}/${size}`;
}

export function bodyUrl(ign: string) {
  return `https://mc-heads.net/body/${encodeURIComponent(ign)}/240`;
}
