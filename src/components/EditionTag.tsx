// Java/Bedrock edition badge based on IGN prefix
export function EditionTag({ ign, size = "sm" }: { ign: string; size?: "sm" | "md" }) {
  const isBedrock = ign.startsWith(".");
  const small = size === "sm";
  const base = small
    ? "text-[9px] px-1.5 py-0.5 gap-1"
    : "text-[10px] px-2 py-0.5 gap-1";

  if (isBedrock) {
    return (
      <span
        className={`inline-flex items-center ${base} rounded-md font-bold uppercase tracking-wider text-white bg-gradient-to-r from-fuchsia-600 to-pink-500 shadow-[0_0_10px_oklch(0.65_0.25_330/0.5)] border border-pink-300/40`}
        title="Bedrock Edition"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
        Bedrock
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center ${base} rounded-md font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-700 to-orange-600 shadow-[0_0_10px_oklch(0.65_0.18_50/0.5)] border border-orange-300/40`}
      title="Java Edition"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
      Java
    </span>
  );
}

// Strip the leading "." that marks bedrock players so it doesn't show in UI
export function displayIgn(ign: string) {
  return ign.startsWith(".") ? ign.slice(1) : ign;
}
