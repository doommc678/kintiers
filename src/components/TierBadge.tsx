import { TIER_COLOR_CLASS, type TierKey } from "@/lib/tiers";

export function TierBadge({ tier, size = "md", retired }: { tier: TierKey; size?: "sm" | "md" | "lg"; retired?: boolean }) {
  const sz = size === "sm" ? "text-[10px] px-1.5 py-0.5" : size === "lg" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-bold tracking-wider ${TIER_COLOR_CLASS[tier]} ${sz} ${retired ? "opacity-50 line-through" : ""}`}
      style={{ boxShadow: "0 2px 8px oklch(0 0 0 / 30%)" }}
    >
      {tier}
    </span>
  );
}
